<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  ref,
  shallowRef,
  computed,
  watch,
  onMounted,
  onUnmounted,
  provide,
  useAttrs,
  type ShallowRef,
} from "vue";
import MapLibreGL, {
  type MapOptions,
  type ProjectionSpecification,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { MAP_KEY } from "./constants";
import { useResolvedTheme } from "./composables/useResolvedTheme";

export interface MapViewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

export type MapStyleOption = string | StyleSpecification;
export type Theme = "light" | "dark";

export type { MapContextValue } from "./constants";

const props = withDefaults(
  defineProps<{
    class?: string;
    theme?: Theme;
    styles?: { light?: MapStyleOption; dark?: MapStyleOption };
    projection?: ProjectionSpecification;
    viewport?: Partial<MapViewport>;
    onViewportChange?: (viewport: MapViewport) => void;
    center?: [number, number];
    zoom?: number;
    bearing?: number;
    pitch?: number;
    minZoom?: number;
    maxZoom?: number;
    minPitch?: number;
    maxPitch?: number;
    maxBounds?: MapLibreGL.LngLatBoundsLike;
    fadeDuration?: number;
  }>(),
  {
    class: "",
  },
);

const emit = defineEmits<{
  load: [];
}>();

defineOptions({
  inheritAttrs: false,
});

const _attrs = useAttrs();

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

const containerRef = ref<HTMLDivElement>();
const mapInstance = shallowRef<MapLibreGL.Map | null>(null);
const isLoaded = ref(false);
const isStyleLoaded = ref(false);
const hasRendered = ref(false);
const currentStyleRef = ref<MapStyleOption | null>(null);
let styleTimeout: ReturnType<typeof setTimeout> | null = null;
let internalUpdate = false;

const themePropRef = computed(() => props.theme);
const resolvedTheme = useResolvedTheme(themePropRef);

const isControlled = computed(
  () => props.viewport !== undefined && props.onViewportChange !== undefined,
);

const mapStyles = computed(() => ({
  dark: props.styles?.dark ?? defaultStyles.dark,
  light: props.styles?.light ?? defaultStyles.light,
}));

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

function clearStyleTimeout() {
  if (styleTimeout) {
    clearTimeout(styleTimeout);
    styleTimeout = null;
  }
}

provide(MAP_KEY, {
  map: mapInstance as ShallowRef<MapLibreGL.Map | null>,
  isLoaded: isLoaded,
  isStyleLoaded: isStyleLoaded,
  hasRendered: hasRendered,
});

defineExpose({
  getMap: () => mapInstance.value,
});

onMounted(() => {
  if (!containerRef.value) return;

  const initialStyle =
    resolvedTheme.value === "dark"
      ? mapStyles.value.dark
      : mapStyles.value.light;
  currentStyleRef.value = initialStyle;

  const maplibreOptions: Partial<MapOptions> = {};

  if (props.center !== undefined) maplibreOptions.center = props.center;
  if (props.zoom !== undefined) maplibreOptions.zoom = props.zoom;
  if (props.bearing !== undefined) maplibreOptions.bearing = props.bearing;
  if (props.pitch !== undefined) maplibreOptions.pitch = props.pitch;
  if (props.minZoom !== undefined) maplibreOptions.minZoom = props.minZoom;
  if (props.maxZoom !== undefined) maplibreOptions.maxZoom = props.maxZoom;
  if (props.minPitch !== undefined) maplibreOptions.minPitch = props.minPitch;
  if (props.maxPitch !== undefined) maplibreOptions.maxPitch = props.maxPitch;
  if (props.maxBounds !== undefined) maplibreOptions.maxBounds = props.maxBounds;
  if (props.fadeDuration !== undefined) maplibreOptions.fadeDuration = props.fadeDuration;

  const map = new MapLibreGL.Map({
    container: containerRef.value,
    style: initialStyle,
    renderWorldCopies: false,
    attributionControl: { compact: true },
    preserveDrawingBuffer: true,
    ...maplibreOptions,
    ...props.viewport,
  } as MapOptions);

  const styleDataHandler = () => {
    clearStyleTimeout();
    styleTimeout = setTimeout(() => {
      isStyleLoaded.value = true;
      if (props.projection) map.setProjection(props.projection);
    }, 100);
  };

  const loadHandler = () => {
    isLoaded.value = true;
    emit("load");
  };

  const renderHandler = () => {
    hasRendered.value = true;
  };

  const handleMove = () => {
    if (internalUpdate) return;
    props.onViewportChange?.(getViewport(map));
  };

  const handleContextLost = (e: Event) => {
    console.warn("WebGL context lost, attempting to restore...");
    e.preventDefault();
  };

  const handleContextRestored = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setStyle(map.getStyle() as any);
  };

  map.on("load", loadHandler);
  map.on("styledata", styleDataHandler);
  map.on("move", handleMove);
  map.on("render", renderHandler);

  const canvas = map.getCanvas();
  canvas.addEventListener("webglcontextlost", handleContextLost as EventListener);
  canvas.addEventListener("webglcontextrestored", handleContextRestored as EventListener);

  mapInstance.value = map;

  const resizeObserver = new ResizeObserver(() => {
    if (mapInstance.value) mapInstance.value.resize();
  });
  resizeObserver.observe(containerRef.value);

  onUnmounted(() => {
    resizeObserver.disconnect();
    clearStyleTimeout();
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    map.off("load", loadHandler);
    map.off("styledata", styleDataHandler);
    map.off("move", handleMove);
    map.off("render", renderHandler);
    map.remove();
    mapInstance.value = null;
    isLoaded.value = false;
    isStyleLoaded.value = false;
  });
});

watch(
  () => props.viewport,
  (viewport) => {
    if (!mapInstance.value || !isControlled.value || !viewport) return;
    if (mapInstance.value.isMoving()) return;

    const current = getViewport(mapInstance.value);
    const next = {
      center: viewport.center ?? current.center,
      zoom: viewport.zoom ?? current.zoom,
      bearing: viewport.bearing ?? current.bearing,
      pitch: viewport.pitch ?? current.pitch,
    };

    if (
      next.center[0] === current.center[0] &&
      next.center[1] === current.center[1] &&
      next.zoom === current.zoom &&
      next.bearing === current.bearing &&
      next.pitch === current.pitch
    ) return;

    internalUpdate = true;
    mapInstance.value.jumpTo(next);
    internalUpdate = false;
  },
  { deep: true },
);

watch(resolvedTheme, (theme) => {
  if (!mapInstance.value || !theme) return;
  const newStyle = theme === "dark" ? mapStyles.value.dark : mapStyles.value.light;
  if (currentStyleRef.value === newStyle) return;
  clearStyleTimeout();
  currentStyleRef.value = newStyle;
  isStyleLoaded.value = false;
  mapInstance.value.setStyle(newStyle, { diff: true });
});

watch(
  () => props.styles,
  (newStyles) => {
    if (!mapInstance.value || !resolvedTheme.value) return;
    const theme = resolvedTheme.value;
    const newStyle =
      theme === "dark"
        ? (newStyles?.dark ?? defaultStyles.dark)
        : (newStyles?.light ?? defaultStyles.light);
    if (currentStyleRef.value === newStyle) return;
    clearStyleTimeout();
    currentStyleRef.value = newStyle;
    isStyleLoaded.value = false;
    mapInstance.value.setStyle(newStyle, { diff: true });
  },
  { deep: true },
);
</script>

<template>
  <div ref="containerRef" :class="cn('relative w-full h-full', props.class)">
    <div
      v-if="!isLoaded"
      class="absolute inset-0 flex items-center justify-center bg-muted/10"
    >
      <div class="flex gap-1">
        <span class="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
        <span class="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:150ms]" />
        <span class="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
    <slot v-if="isLoaded && isStyleLoaded" />
  </div>
</template>
