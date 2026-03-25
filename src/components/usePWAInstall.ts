import { ref, onMounted, onUnmounted } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isInstallable = ref(false)

export const isMobile = ref(false)
export const isChrome = ref(false)

async function detectUA() {
  const ua = navigator.userAgent
  isMobile.value = /Android|iPhone|iPad|iPod/i.test(ua)

  const looksLikeChrome = /Chrome\//.test(ua) && !/OPR\/|Edg\/|SamsungBrowser|UCBrowser|Firefox/.test(ua)
  const isBrave = looksLikeChrome
    ? await (navigator as any).brave?.isBrave?.().catch(() => false) ?? false
    : false
  isChrome.value = looksLikeChrome && !isBrave
}

export function usePWAInstall() {
  function onBeforeInstallPrompt(e: Event) {
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
    isInstallable.value = true
  }

  function onAppInstalled() {
    deferredPrompt.value = null
    isInstallable.value = false
  }

  onMounted(() => {
    detectUA()
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  async function install() {
    if (!deferredPrompt.value) return
    await deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      deferredPrompt.value = null
      isInstallable.value = false
    }
  }

  return { isInstallable, install, isMobile, isChrome }
}
