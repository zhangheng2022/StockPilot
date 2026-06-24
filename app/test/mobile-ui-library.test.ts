import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')

describe('mobile UI library integration', () => {
  it('uses Vant through the Nuxt module for mobile interactions', () => {
    const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    const nuxtConfig = readFileSync(resolve(root, 'nuxt.config.ts'), 'utf8')

    expect(packageJson.dependencies).toMatchObject({
      vant: expect.any(String),
      '@vant/nuxt': expect.any(String),
    })
    expect(packageJson.dependencies).not.toHaveProperty('primevue')
    expect(packageJson.dependencies).not.toHaveProperty('@nuxt/ui')
    expect(nuxtConfig).toContain("'@vant/nuxt'")
  })

  it('customizes the Vant theme through global StockPilot tokens', () => {
    const themeCss = readFileSync(resolve(root, 'app/assets/css/main.css'), 'utf8')

    expect(themeCss).toContain('html:root')
    expect(themeCss).toContain('--van-primary-color: #00327d')
    expect(themeCss).toContain('--van-text-color: #191b22')
    expect(themeCss).toContain('--van-text-color-2: #687083')
    expect(themeCss).toContain('--van-border-color: #d9deea')
    expect(themeCss).toContain('--van-tabbar-item-active-color: #00327d')
    expect(themeCss).toContain('--van-floating-bubble-size: 56px')
    expect(themeCss).toContain('--van-floating-bubble-background: #00327d')
  })

  it('exposes a small mobile feedback composable for imperative interactions', () => {
    const source = readFileSync(resolve(root, 'app/composables/useMobileFeedback.ts'), 'utf8')

    expect(source).toContain("from 'vant'")
    expect(source).toContain('showToast')
    expect(source).toContain('showConfirmDialog')
  })

  it('uses Vant for global mobile navigation and generic page states', () => {
    const bottomNav = readFileSync(resolve(root, 'app/components/layout/AppBottomNav.vue'), 'utf8')
    const topBar = readFileSync(resolve(root, 'app/components/layout/AppTopBar.vue'), 'utf8')
    const floatingAction = readFileSync(resolve(root, 'app/components/layout/FloatingActionButton.vue'), 'utf8')
    const homePage = readFileSync(resolve(root, 'app/pages/index.vue'), 'utf8')

    expect(bottomNav).toContain('<van-tabbar')
    expect(bottomNav).toContain('<van-tabbar-item')
    expect(bottomNav).toContain(':icon="item.icon"')
    expect(bottomNav).not.toContain('active-color=')
    expect(bottomNav).not.toContain('inactive-color=')
    expect(topBar).toContain('<van-nav-bar')
    expect(floatingAction).toContain('<van-floating-bubble')
    expect(floatingAction).toContain('icon="plus"')
    expect(floatingAction).toContain('axis="lock"')
    expect(floatingAction).toContain(':gap="{ x: 20, y: 76 }"')
    expect(floatingAction).toContain("router.push('/decisions/new')")
    expect(floatingAction).not.toContain('--van-floating-bubble')
    expect(homePage).toContain('<van-notice-bar')
    expect(homePage).toContain('<van-loading')
    expect(homePage).toContain('<van-empty')
  })

  it('uses Vant for generic business-card controls without replacing custom card structure', () => {
    const triggerCard = readFileSync(resolve(root, 'app/components/dashboard/TriggerEventCard.vue'), 'utf8')
    const disciplineCard = readFileSync(resolve(root, 'app/components/dashboard/DisciplineCardPreview.vue'), 'utf8')

    expect(triggerCard).toContain('<article')
    expect(triggerCard).toContain('<van-tag')
    expect(triggerCard).toContain('<van-button')
    expect(disciplineCard).toContain('<article')
    expect(disciplineCard).toContain('<van-progress')
    expect(disciplineCard).toContain('<van-button')
  })

  it('uses Vant empty states for unfinished placeholder pages', () => {
    for (const file of ['reviews.vue', 'me.vue']) {
      const source = readFileSync(resolve(root, 'app/pages', file), 'utf8')

      expect(source).toContain('<van-empty')
      expect(source).toContain('功能待接入')
    }
  })

  it('uses Vant mobile controls for decision and discipline card workflows', () => {
    const decisions = readFileSync(resolve(root, 'app/pages/decisions.vue'), 'utf8')
    const newDecision = readFileSync(resolve(root, 'app/pages/decisions/new.vue'), 'utf8')
    const quality = readFileSync(resolve(root, 'app/pages/decisions/[id]/quality.vue'), 'utf8')
    const disciplineCards = readFileSync(resolve(root, 'app/pages/discipline-cards.vue'), 'utf8')
    const disciplineDetail = readFileSync(resolve(root, 'app/pages/discipline-cards/[id].vue'), 'utf8')

    expect(decisions).toContain('<van-loading')
    expect(decisions).toContain('<van-empty')
    expect(newDecision).toContain('<van-form')
    expect(newDecision).toContain('<van-field')
    expect(newDecision).toContain('<van-radio-group')
    expect(newDecision).toContain('<van-slider')
    expect(quality).toContain('<van-cell-group')
    expect(disciplineCards).toContain('<van-tag')
    expect(disciplineDetail).toContain('<van-cell-group')
  })
})
