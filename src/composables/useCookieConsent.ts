import { ref, computed, readonly } from 'vue'
import Clarity from '@microsoft/clarity'

const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID as string
const CONSENT_KEY = 'cookie_consent'

type ConsentStatus = 'granted' | 'denied' | null

const consentStatus = ref<ConsentStatus>(
  (localStorage.getItem(CONSENT_KEY) as ConsentStatus) ?? null,
)

let clarityInitialized = false

function initClarity() {
  if (clarityInitialized || !CLARITY_PROJECT_ID) return
  clarityInitialized = true
  Clarity.init(CLARITY_PROJECT_ID)
}

// Initialize Clarity on page load if already consented
if (consentStatus.value === 'granted') {
  initClarity()
  Clarity.consentV2({ ad_Storage: 'granted', analytics_Storage: 'granted' })
}

export function useCookieConsent() {
  const showBanner = computed(() => consentStatus.value === null)

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'granted')
    consentStatus.value = 'granted'
    initClarity()
    Clarity.consentV2({ ad_Storage: 'granted', analytics_Storage: 'granted' })
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'denied')
    consentStatus.value = 'denied'
    initClarity()
    Clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'denied' })
  }

  return {
    consentStatus: readonly(consentStatus),
    showBanner,
    accept,
    decline,
  }
}
