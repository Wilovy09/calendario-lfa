<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
</script>

<template>
  <AppLayout title="Políticas de Privacidad" :back="true">
    <div class="mx-auto max-w-3xl px-4 py-10">
      <div class="space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">

        <!-- Intro -->
        <section class="space-y-2">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Políticas de Privacidad
          </h1>
          <p class="text-slate-500 dark:text-slate-500">Última actualización: marzo 2026</p>
          <p>
            <span class="font-medium text-slate-800 dark:text-slate-200">Calendario LFA</span> es
            un sitio web no oficial creado por un fan, sin fines de lucro, con el objetivo de
            ofrecer una mejor visualización de los partidos de la Liga de Fútbol Americano (LFA).
            Este sitio no tiene ninguna afiliación oficial con la liga ni con sus equipos.
          </p>
        </section>

        <!-- Datos que recopilamos -->
        <section class="space-y-2">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
            Datos que recopilamos
          </h2>
          <p>
            No recopilamos ni almacenamos datos personales identificables de forma directa. Sin
            embargo, utilizamos herramientas de terceros que pueden recopilar datos de uso de forma
            anónima o pseudónima para mejorar la experiencia del sitio.
          </p>
        </section>

        <!-- Microsoft Clarity -->
        <section class="space-y-3">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
            Microsoft Clarity
          </h2>
          <p>
            Este sitio utiliza
            <span class="font-medium text-slate-800 dark:text-slate-200">Microsoft Clarity</span>,
            una herramienta gratuita de analítica de comportamiento proporcionada por Microsoft.
            Clarity nos ayuda a entender cómo los usuarios interactúan con el sitio mediante:
          </p>
          <ul class="list-inside list-disc space-y-1 pl-2">
            <li>Grabaciones de sesión (session replays)</li>
            <li>Mapas de calor (heatmaps)</li>
            <li>Métricas de uso y navegación</li>
          </ul>
          <p>
            Para cumplir con esta funcionalidad, Clarity puede almacenar cookies de primera parte
            en tu navegador que permiten identificar tu sesión de forma anónima.
            <span class="font-medium text-slate-800 dark:text-slate-200">
              No vendemos ni compartimos tus datos con terceros.
            </span>
          </p>
          <p>
            Microsoft procesa estos datos conforme a su propia política de privacidad. Puedes
            consultarla en
            <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer"
              class="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-400">privacy.microsoft.com</a>.
            También puedes optar por no ser rastreado mediante el complemento de exclusión de
            Clarity en
            <a href="https://clarity.microsoft.com/optout" target="_blank" rel="noopener noreferrer"
              class="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-400">clarity.microsoft.com/optout</a>.
          </p>
        </section>

        <!-- Cookies -->
        <section class="space-y-2">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Cookies</h2>
          <p>
            Usamos cookies únicamente para las siguientes finalidades:
          </p>
          <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-d-border">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-600 dark:bg-d-raised dark:text-slate-400">
                <tr>
                  <th class="px-4 py-2 font-semibold">Cookie</th>
                  <th class="px-4 py-2 font-semibold">Origen</th>
                  <th class="px-4 py-2 font-semibold">Propósito</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-d-border">
                <tr>
                  <td class="px-4 py-2 font-mono">cookie_consent</td>
                  <td class="px-4 py-2">Calendario LFA</td>
                  <td class="px-4 py-2">Guarda tu preferencia de consentimiento de cookies</td>
                </tr>
                <tr>
                  <td class="px-4 py-2 font-mono">_clck, _clsk, CLID</td>
                  <td class="px-4 py-2">Microsoft Clarity</td>
                  <td class="px-4 py-2">Identificación de sesión anónima para analítica</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Puedes rechazar las cookies de analítica desde el aviso que aparece al entrar al sitio,
            o eliminarlas en cualquier momento desde la configuración de tu navegador.
          </p>
        </section>

        <!-- Autenticación -->
        <section class="space-y-2">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
            Autenticación con redes sociales
          </h2>
          <p>
            El sitio ofrece inicio de sesión opcional mediante Google y Facebook, gestionado a
            través de <span class="font-medium text-slate-800 dark:text-slate-200">Supabase</span>.
            Si decides iniciar sesión, únicamente almacenamos tu nombre y correo electrónico
            para identificarte dentro del sitio. No compartimos esta información con terceros.
          </p>
          <p>
            El inicio de sesión con Facebook está sujeto a la
            <a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer"
              class="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-400">Política
              de datos de Meta</a>.
          </p>
        </section>

        <!-- Eliminación de datos -->
        <section class="space-y-2">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
            Eliminación de datos
          </h2>
          <p>
            Puedes solicitar la eliminación completa de tus datos en cualquier momento. Para hacerlo,
            envía un correo a
            <a href="mailto:emilianom179@gmail.com"
              class="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-400">emilianom179@gmail.com</a>
            con el asunto <span
              class="font-mono text-xs bg-slate-100 dark:bg-d-raised px-1.5 py-0.5 rounded">Eliminación de datos</span>
            indicando el correo electrónico con el que iniciaste sesión.
          </p>
          <p>
            Procesaremos tu solicitud y eliminaremos tu cuenta y datos asociados en un plazo
            máximo de <span class="font-medium text-slate-800 dark:text-slate-200">30 días</span>.
          </p>
        </section>

        <!-- Contacto -->
        <section class="space-y-2">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Contacto</h2>
          <p>
            Si tienes preguntas sobre estas políticas, puedes abrir un issue en el repositorio del
            proyecto o contactarnos directamente.
          </p>
        </section>

      </div>
    </div>
  </AppLayout>
</template>
