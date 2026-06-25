# AI-first UI Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first-phase complete mobile UI interaction flow for Stock Pilot as an AI-first trading discipline assistant.

**Architecture:** Keep the current Nuxt 4 + Vant + Tailwind v4 frontend stack and existing Worker APIs. This phase changes user-facing routes, labels, components, and client-side interaction state; it does not add real market/news data sources or production AI endpoints. The new interview UI generates the existing `NewDecisionInput` shape and submits through the existing `/api/decisions` endpoint when the user chooses “开始盯盘”.

**Tech Stack:** Nuxt 4 SPA, Vue 3 Composition API, Vant 4, Tailwind CSS v4, Vitest, existing shared contracts.

---

## Scope

This plan implements first-phase UI interactions only:

- User-facing language changes: 决策 -> 交易计划 / 想法, 纪律卡 -> 盯盘, 复盘 -> 交易总结, AI 质检 -> AI 检查计划.
- New “AI 追问 + 即时纠偏 + 计划预览” interaction on `app/pages/decisions/new.vue`.
- “今天要处理” action-oriented dashboard using the existing `/dashboard/today` payload.
- Renamed list/detail surfaces for 想法、盯盘、交易总结.
- Frontend tests that prevent old hard-to-understand terms from returning.

Out of scope for this plan:

- Real LLM backend calls.
- Real market price feeds.
- Real announcement/news/financial-report ingestion.
- D1 schema changes.
- New Worker routes beyond existing `/decisions`, `/discipline-cards`, and `/dashboard/today`.

The UI must not silently show mock production data. Empty or unimplemented API surfaces remain explicit.

## File Structure

- Modify `app/data/navigation.ts`  
  Defines bottom navigation labels and Vant icons.

- Modify `app/assets/css/main.css`  
  Updates product palette and reusable interaction utilities while staying in Tailwind v4 CSS-first configuration.

- Modify `app/components/layout/AppTopBar.vue`  
  Updates header language and primary AI assistant tone.

- Modify `app/components/layout/FloatingActionButton.vue`  
  Changes the global action from “新建决策” to “记录想法”.

- Create `app/composables/useAiPlanInterview.ts`  
  Owns client-side interview state, deterministic correction rules, completeness checks, and mapping into `NewDecisionInput`.

- Modify `app/pages/decisions/new.vue`  
  Replaces the long form with the AI interview, correction cards, and plan preview. Uses existing `apiRequest<CreatedDecision>('/decisions')`.

- Modify `app/pages/index.vue`  
  Reworks today dashboard into “今天要处理”.

- Modify `app/components/dashboard/AiSummaryPanel.vue`  
  Turns the summary into an AI work brief.

- Modify `app/components/dashboard/TriggerEventCard.vue`  
  Turns trigger cards into user-facing action cards.

- Modify `app/components/dashboard/DisciplineCardRail.vue` and `app/components/dashboard/DisciplineCardPreview.vue`  
  Renames rail to ongoing AI watching language without changing props.

- Modify `app/pages/decisions.vue`  
  Renames list to “想法与交易计划” and updates status/action language.

- Modify `app/pages/decisions/[id]/quality.vue`  
  Renames “AI 质检结果” to “AI 检查计划” and changes CTA to “查看盯盘”.

- Modify `app/pages/discipline-cards.vue` and `app/pages/discipline-cards/[id].vue`  
  Renames pages to “盯盘” and explains AI 持续盯盘.

- Modify `app/pages/reviews.vue` and `app/pages/me.vue`  
  Keeps unimplemented API surfaces explicit while changing language to “交易总结” and “我的交易问题”.

- Modify `app/test/today-dashboard.test.ts`  
  Updates navigation expectations and language guardrails.

- Modify `app/test/business-pages.test.ts`  
  Updates route/source assertions and forbids old product terms in visible page copy.

- Create `app/test/ai-plan-interview.test.ts`  
  Unit-tests the interview state machine and correction rules.

---

### Task 1: Navigation And Product Language Guardrails

**Files:**
- Modify: `app/data/navigation.ts`
- Modify: `app/components/layout/AppTopBar.vue`
- Modify: `app/components/layout/FloatingActionButton.vue`
- Modify: `app/test/today-dashboard.test.ts`
- Modify: `app/test/business-pages.test.ts`

- [ ] **Step 1: Write failing navigation tests**

Replace the navigation label/icon expectation in `app/test/today-dashboard.test.ts` with:

```ts
  it('uses plain-language bottom navigation for the AI-first flow', () => {
    expect(bottomNavigationItems).toEqual([
      { label: '今天', href: '/', active: true, icon: 'home-o' },
      { label: '想法', href: '/decisions', active: false, icon: 'comment-o' },
      { label: '盯盘', href: '/discipline-cards', active: false, icon: 'eye-o' },
      { label: '总结', href: '/reviews', active: false, icon: 'notes-o' },
      { label: '我的', href: '/me', active: false, icon: 'user-o' },
    ])
  })
```

Add this test to `app/test/business-pages.test.ts`:

```ts
  it('keeps old internal product terms out of primary page copy', () => {
    const files = [
      'index.vue',
      'decisions.vue',
      'decisions/new.vue',
      'decisions/[id]/quality.vue',
      'discipline-cards.vue',
      'discipline-cards/[id].vue',
      'reviews.vue',
    ]

    for (const file of files) {
      const source = readFileSync(resolve(pagesRoot, file), 'utf8')

      expect(source).not.toContain('纪律卡')
      expect(source).not.toContain('AI 质检')
      expect(source).not.toContain('复盘')
    }
  })
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```powershell
npm test -- app/test/today-dashboard.test.ts app/test/business-pages.test.ts
```

Expected: FAIL because current labels still include `决策`, `纪律卡`, `复盘`, and old Vant icons.

- [ ] **Step 3: Update navigation**

Change `app/data/navigation.ts` to:

```ts
import type { BottomNavigationItem } from '../types/dashboard'

export const bottomNavigationItems: BottomNavigationItem[] = [
  { label: '今天', href: '/', active: true, icon: 'home-o' },
  { label: '想法', href: '/decisions', active: false, icon: 'comment-o' },
  { label: '盯盘', href: '/discipline-cards', active: false, icon: 'eye-o' },
  { label: '总结', href: '/reviews', active: false, icon: 'notes-o' },
  { label: '我的', href: '/me', active: false, icon: 'user-o' },
]
```

- [ ] **Step 4: Update global header and floating action**

In `app/components/layout/AppTopBar.vue`, change visible copy and aria labels:

```vue
<template>
  <header class="sticky top-0 z-30 border-b border-stock-line/60 bg-stock-background/92 backdrop-blur">
    <van-nav-bar :border="false">
      <template #title>
        <NuxtLink class="flex items-center gap-2" to="/" aria-label="Stock Pilot 首页">
          <div class="grid size-7 place-items-center rounded bg-stock-primary text-xs font-bold text-white">
            AI
          </div>
          <div class="leading-tight">
            <h1 class="text-base font-bold tracking-normal text-stock-primary">
              Stock Pilot
            </h1>
            <p class="text-[11px] font-medium text-stock-muted">
              交易纪律助手
            </p>
          </div>
        </NuxtLink>
      </template>
      <template #right>
        <van-button icon="bell" size="small" aria-label="查看提醒" />
      </template>
    </van-nav-bar>
  </header>
</template>
```

In `app/components/layout/FloatingActionButton.vue`, change the aria label:

```vue
<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <van-floating-bubble
    class="shadow-lg"
    icon="plus"
    axis="lock"
    :gap="{ x: 20, y: 76 }"
    aria-label="记录交易想法"
    @click="router.push('/decisions/new')"
  />
</template>
```

- [ ] **Step 5: Run tests and verify pass for Task 1**

Run:

```powershell
npm test -- app/test/today-dashboard.test.ts app/test/business-pages.test.ts
```

Expected: PASS for navigation tests. The product-term guardrail may still fail until later tasks update page copy; keep the failure visible.

- [ ] **Step 6: Commit**

Run:

```powershell
git add app/data/navigation.ts app/components/layout/AppTopBar.vue app/components/layout/FloatingActionButton.vue app/test/today-dashboard.test.ts app/test/business-pages.test.ts
git commit -m "feat: update ai-first navigation language"
```

---

### Task 2: AI Interview State Machine

**Files:**
- Create: `app/composables/useAiPlanInterview.ts`
- Create: `app/test/ai-plan-interview.test.ts`

- [ ] **Step 1: Write failing interview tests**

Create `app/test/ai-plan-interview.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createAiPlanInterview } from '../composables/useAiPlanInterview'

describe('AI plan interview', () => {
  it('starts from a natural trading idea and asks one question at a time', () => {
    const interview = createAiPlanInterview()

    interview.start('我想买宁德时代')

    expect(interview.state.value.ideaText).toBe('我想买宁德时代')
    expect(interview.currentQuestion.value?.id).toBe('target')
    expect(interview.messages.value.at(-1)?.role).toBe('assistant')
    expect(interview.messages.value.at(-1)?.text).toContain('哪只股票')
  })

  it('corrects vague invalidation answers immediately', () => {
    const interview = createAiPlanInterview()
    interview.start('我想买宁德时代')
    interview.answerCurrentQuestion('宁德时代 300750 买入')
    interview.answerCurrentQuestion('我觉得新能源会反弹')
    interview.answerCurrentQuestion('跌了我就再等等')

    expect(interview.currentQuestion.value?.id).toBe('invalidation')
    expect(interview.messages.value.at(-1)?.tone).toBe('correction')
    expect(interview.messages.value.at(-1)?.text).toContain('不是明确的停止条件')
  })

  it('blocks start watching until required answers pass correction rules', () => {
    const interview = createAiPlanInterview()
    interview.start('我想满仓买宁德时代')
    interview.answerCurrentQuestion('宁德时代 300750 买入')
    interview.answerCurrentQuestion('我觉得肯定会涨')

    expect(interview.canPreview.value).toBe(false)
    expect(interview.preview.value).toBeNull()
  })

  it('maps a completed interview into NewDecisionInput', () => {
    const interview = createAiPlanInterview()
    interview.start('我想买宁德时代')
    interview.answerCurrentQuestion('宁德时代 300750 买入')
    interview.answerCurrentQuestion('业绩增速恢复，电池出货量改善，但我只打算小仓位验证')
    interview.answerCurrentQuestion('如果跌破成本 8% 且放量下跌，就停止买入逻辑')
    interview.answerCurrentQuestion('计划仓位 10%，最多接受 8% 回撤')
    interview.answerCurrentQuestion('盯价格、成交量和下一次财报')

    expect(interview.canPreview.value).toBe(true)
    expect(interview.preview.value).toMatchObject({
      stockCode: '300750',
      stockName: '宁德时代',
      action: 'buy',
      plannedPosition: 0.1,
    })
  })
})
```

- [ ] **Step 2: Run test and verify failure**

Run:

```powershell
npm test -- app/test/ai-plan-interview.test.ts
```

Expected: FAIL because `useAiPlanInterview.ts` does not exist.

- [ ] **Step 3: Implement interview composable**

Create `app/composables/useAiPlanInterview.ts`:

```ts
import type { DecisionAction, NewDecisionInput } from '../types/decisions'

type QuestionId = 'target' | 'rationale' | 'invalidation' | 'risk' | 'watching'
type MessageTone = 'normal' | 'correction' | 'success'

type InterviewMessage = {
  role: 'user' | 'assistant'
  text: string
  tone?: MessageTone
}

type InterviewAnswer = {
  target?: string
  rationale?: string
  invalidation?: string
  risk?: string
  watching?: string
}

type Question = {
  id: QuestionId
  text: string
}

const questions: Question[] = [
  { id: 'target', text: '你想操作哪只股票？请写股票名称、代码，以及买入、加仓、减仓、持有或卖出。' },
  { id: 'rationale', text: '为什么现在要这么做？请写你自己的理由，不用追求专业术语。' },
  { id: 'invalidation', text: '什么情况说明你想错了？请写清楚价格、事件或时间边界。' },
  { id: 'risk', text: '这次最多愿意承担多少？请写计划仓位、止损或最大亏损。' },
  { id: 'watching', text: '接下来需要盯什么？可以是价格、成交量、公告、财报或时间点。' },
]

export function createAiPlanInterview() {
  const state = ref({
    ideaText: '',
    currentIndex: 0,
    answers: {} as InterviewAnswer,
  })
  const messages = ref<InterviewMessage[]>([])

  const currentQuestion = computed(() => questions[state.value.currentIndex] ?? null)

  const canPreview = computed(() => {
    return Boolean(
      state.value.answers.target
      && state.value.answers.rationale
      && state.value.answers.invalidation
      && state.value.answers.risk
      && state.value.answers.watching,
    )
  })

  const preview = computed<NewDecisionInput | null>(() => {
    if (!canPreview.value) return null
    return buildDecisionInput(state.value.answers)
  })

  function start(text: string) {
    const trimmed = text.trim()
    state.value.ideaText = trimmed
    state.value.currentIndex = 0
    state.value.answers = {}
    messages.value = [
      { role: 'user', text: trimmed || '我想记录一个交易想法' },
      { role: 'assistant', text: questions[0].text },
    ]
  }

  function answerCurrentQuestion(text: string) {
    const question = currentQuestion.value
    if (!question) return

    const answer = text.trim()
    messages.value.push({ role: 'user', text: answer })

    const correction = correctionFor(question.id, answer)
    if (correction) {
      messages.value.push({ role: 'assistant', text: correction, tone: 'correction' })
      return
    }

    state.value.answers[question.id] = answer
    state.value.currentIndex += 1

    const nextQuestion = currentQuestion.value
    if (nextQuestion) {
      messages.value.push({ role: 'assistant', text: nextQuestion.text })
      return
    }

    messages.value.push({
      role: 'assistant',
      text: '这份交易想法已经足够生成计划预览。请检查后再决定是否开始盯盘。',
      tone: 'success',
    })
  }

  function editQuestion(id: QuestionId) {
    const index = questions.findIndex(question => question.id === id)
    if (index === -1) return
    state.value.currentIndex = index
    delete state.value.answers[id]
    messages.value.push({ role: 'assistant', text: questions[index].text })
  }

  return {
    state,
    messages,
    currentQuestion,
    canPreview,
    preview,
    start,
    answerCurrentQuestion,
    editQuestion,
  }
}

function correctionFor(id: QuestionId, answer: string) {
  if (answer.length < 4) return '这个回答太短了。请补充到可以执行的程度。'

  if (id === 'rationale' && /肯定|必涨|稳赚|一定/.test(answer)) {
    return '不能把确定性判断当作计划依据。请补充证据，并说明什么情况会证明这次判断错了。'
  }

  if (id === 'invalidation' && /(再等等|看情况|到时候|不好说)/.test(answer)) {
    return '这不是明确的停止条件。请补充价格、事件或时间边界，例如“跌破成本 8% 且放量下跌”。'
  }

  if (id === 'risk' && /(满仓|全仓|梭哈)/.test(answer)) {
    return '仓位过高会让计划很难执行。请写清楚最大亏损承受能力，或改成更具体的计划仓位。'
  }

  return ''
}

function buildDecisionInput(answers: InterviewAnswer): NewDecisionInput {
  const target = answers.target ?? ''
  const action = parseAction(target)

  return {
    stockCode: parseStockCode(target),
    stockName: parseStockName(target),
    action,
    rationale: answers.rationale ?? '',
    evidence: answers.rationale ?? '',
    risk: answers.risk ?? '',
    plannedPosition: parsePosition(answers.risk ?? ''),
    invalidationCondition: answers.invalidation ?? '',
    exitCondition: answers.watching ?? '',
  }
}

function parseAction(text: string): DecisionAction {
  if (text.includes('加仓')) return 'add'
  if (text.includes('减仓')) return 'reduce'
  if (text.includes('持有') || text.includes('继续拿')) return 'hold'
  if (text.includes('卖')) return 'sell'
  return 'buy'
}

function parseStockCode(text: string) {
  return text.match(/\b\d{5,6}\b/)?.[0] ?? ''
}

function parseStockName(text: string) {
  const withoutCode = text.replace(/\b\d{5,6}\b/g, '')
  const withoutAction = withoutCode.replace(/买入|买|加仓|减仓|持有|继续拿着|继续拿|卖出|卖/g, '')
  return withoutAction.trim().split(/\s+/)[0] ?? ''
}

function parsePosition(text: string) {
  const percent = text.match(/(\d{1,3})\s*%/)
  if (!percent) return 0.1
  const value = Number(percent[1])
  if (!Number.isFinite(value)) return 0.1
  return Math.min(Math.max(value / 100, 0), 1)
}
```

- [ ] **Step 4: Run interview tests**

Run:

```powershell
npm test -- app/test/ai-plan-interview.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```powershell
git add app/composables/useAiPlanInterview.ts app/test/ai-plan-interview.test.ts
git commit -m "feat: add ai plan interview state"
```

---

### Task 3: AI Interview Page And Plan Preview

**Files:**
- Modify: `app/pages/decisions/new.vue`
- Modify: `app/test/business-pages.test.ts`

- [ ] **Step 1: Write failing page source test**

Add this test to `app/test/business-pages.test.ts`:

```ts
  it('renders the new trading idea flow as AI interview plus plan preview', () => {
    const source = readFileSync(resolve(pagesRoot, 'decisions/new.vue'), 'utf8')

    expect(source).toContain('记录交易想法')
    expect(source).toContain('AI 会追问')
    expect(source).toContain('计划预览')
    expect(source).toContain('开始盯盘')
    expect(source).toContain('createAiPlanInterview')
    expect(source).toContain("apiRequest<CreatedDecision>('/decisions'")
    expect(source).not.toContain('<van-form')
  })
```

- [ ] **Step 2: Run test and verify failure**

Run:

```powershell
npm test -- app/test/business-pages.test.ts
```

Expected: FAIL because `decisions/new.vue` still renders the old long form.

- [ ] **Step 3: Replace new decision page**

Replace `app/pages/decisions/new.vue` with:

```vue
<script setup lang="ts">
import type { CreatedDecision } from '../../types/decisions'

const router = useRouter()
const feedback = useMobileFeedback()
const interview = createAiPlanInterview()
const ideaDraft = ref('')
const answerDraft = ref('')
const submitting = ref(false)
const submitError = ref('')

const preview = interview.preview

function beginInterview() {
  interview.start(ideaDraft.value)
}

function submitAnswer() {
  interview.answerCurrentQuestion(answerDraft.value)
  answerDraft.value = ''
}

function saveIdea() {
  feedback.success('已保存为想法草稿')
}

async function startWatching() {
  if (!preview.value) return

  submitError.value = ''
  submitting.value = true
  const toast = feedback.loading('正在创建交易计划...')

  try {
    const result = await apiRequest<CreatedDecision>('/decisions', {
      method: 'POST',
      body: preview.value,
    })
    feedback.success('已开始盯盘')
    await router.push({
      path: `/decisions/${result.decision.id}/quality`,
      query: {
        cardId: result.disciplineCard.id,
      },
    })
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : '交易计划保存失败'
    feedback.error(submitError.value)
  } finally {
    toast.close()
    submitting.value = false
  }
}
</script>

<template>
  <section class="space-y-5">
    <div class="flex items-center gap-2">
      <van-button
        icon="arrow-left"
        size="small"
        plain
        hairline
        to="/decisions"
        aria-label="返回想法列表"
      />
      <div>
        <p class="text-xs font-semibold text-stock-muted">
          AI 追问
        </p>
        <h2 class="text-xl font-semibold">
          记录交易想法
        </h2>
      </div>
    </div>

    <van-notice-bar
      v-if="submitError"
      wrapable
      :scrollable="false"
      color="#991b1b"
      background="#fef2f2"
      :text="submitError"
    />

    <article class="rounded-lg bg-stock-surface p-4 shadow-sm ring-1 ring-stock-line">
      <p class="text-sm leading-6 text-stock-muted">
        先用一句话说出你的交易想法。AI 会追问、纠正模糊回答，并在信息足够后生成计划预览。
      </p>
      <div class="mt-4 space-y-3">
        <van-field
          v-model="ideaDraft"
          type="textarea"
          autosize
          rows="2"
          placeholder="例如：我想买宁德时代"
        />
        <van-button
          block
          type="primary"
          icon="comment-o"
          :disabled="ideaDraft.trim().length === 0"
          @click="beginInterview"
        >
          让 AI 开始追问
        </van-button>
      </div>
    </article>

    <section
      v-if="interview.messages.value.length > 0"
      class="space-y-3"
    >
      <article
        v-for="(message, index) in interview.messages.value"
        :key="`${message.role}-${index}`"
        class="rounded-lg p-3 text-sm leading-6"
        :class="message.role === 'assistant'
          ? message.tone === 'correction'
            ? 'bg-red-50 text-red-900 ring-1 ring-red-100'
            : 'bg-stock-primary-soft text-stock-primary'
          : 'bg-stock-surface text-stock-text ring-1 ring-stock-line'"
      >
        <p class="mb-1 text-xs font-semibold">
          {{ message.role === 'assistant' ? 'AI' : '你' }}
        </p>
        <p>{{ message.text }}</p>
      </article>
    </section>

    <article
      v-if="interview.currentQuestion.value"
      class="rounded-lg bg-stock-surface p-4 shadow-sm ring-1 ring-stock-line"
    >
      <van-field
        v-model="answerDraft"
        type="textarea"
        autosize
        rows="3"
        placeholder="写下你的回答"
      />
      <van-button
        class="mt-3"
        block
        type="primary"
        :disabled="answerDraft.trim().length === 0"
        @click="submitAnswer"
      >
        回答并继续
      </van-button>
    </article>

    <article
      v-if="preview"
      class="rounded-lg bg-stock-surface p-4 shadow-sm ring-1 ring-stock-line"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold text-stock-muted">
            计划预览
          </p>
          <h3 class="text-lg font-semibold">
            {{ preview.stockName }} · {{ preview.stockCode }}
          </h3>
        </div>
        <van-tag type="success">
          可开始盯盘
        </van-tag>
      </div>

      <div class="mt-4 space-y-3 text-sm leading-6">
        <p><strong>我为什么这么做：</strong>{{ preview.rationale }}</p>
        <p><strong>什么情况要停下来：</strong>{{ preview.invalidationCondition }}</p>
        <p><strong>最多愿意承担：</strong>{{ preview.risk }}</p>
        <p><strong>接下来盯什么：</strong>{{ preview.exitCondition }}</p>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <van-button plain type="primary" @click="saveIdea">
          保存为想法
        </van-button>
        <van-button type="primary" :loading="submitting" @click="startWatching">
          开始盯盘
        </van-button>
      </div>
    </article>
  </section>
</template>
```

- [ ] **Step 4: Run relevant tests**

Run:

```powershell
npm test -- app/test/ai-plan-interview.test.ts app/test/business-pages.test.ts
```

Expected: PASS for interview and new-page tests. Product-term guardrail may still fail until later page rename tasks.

- [ ] **Step 5: Commit**

Run:

```powershell
git add app/pages/decisions/new.vue app/test/business-pages.test.ts
git commit -m "feat: build ai interview plan page"
```

---

### Task 4: Today Action Dashboard

**Files:**
- Modify: `app/pages/index.vue`
- Modify: `app/components/dashboard/AiSummaryPanel.vue`
- Modify: `app/components/dashboard/TriggerEventCard.vue`
- Modify: `app/components/dashboard/DisciplineCardRail.vue`
- Modify: `app/components/dashboard/DisciplineCardPreview.vue`
- Modify: `app/test/today-dashboard.test.ts`

- [ ] **Step 1: Write failing dashboard language test**

Add this test to `app/test/today-dashboard.test.ts`:

```ts
  it('frames the home page as today action work instead of an internal dashboard', () => {
    const source = readFileSync(resolve(pagesRoot, 'index.vue'), 'utf8')

    expect(source).toContain('今天要处理')
    expect(source).toContain('记录一个交易想法')
    expect(source).toContain('AI 持续盯盘')
    expect(source).not.toContain('待处理触发')
    expect(source).not.toContain('待复核纪律卡')
  })
```

- [ ] **Step 2: Run test and verify failure**

Run:

```powershell
npm test -- app/test/today-dashboard.test.ts
```

Expected: FAIL because the current home page still uses old dashboard language.

- [ ] **Step 3: Update `AiSummaryPanel.vue`**

Replace the template with:

```vue
<template>
  <section class="space-y-3">
    <div class="space-y-1">
      <p class="text-sm text-stock-muted">{{ summary.greeting }}</p>
      <h2 class="text-2xl font-semibold leading-tight">
        今天要处理
      </h2>
    </div>
    <div class="rounded-lg border border-stock-primary/10 bg-stock-primary-soft p-4">
      <div class="flex gap-3">
        <div class="grid size-8 shrink-0 place-items-center rounded bg-stock-primary text-xs font-bold text-white">
          AI
        </div>
        <div class="space-y-1">
          <p class="font-semibold text-stock-primary">
            AI 持续盯盘中
          </p>
          <p class="text-sm leading-6 text-stock-muted">
            {{ summary.message || summary.detail }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Update `TriggerEventCard.vue` visible language**

Change visible labels:

```vue
<p class="text-sm text-stock-muted">AI 来源：{{ trigger.source }}</p>
```

```vue
<p class="font-mono text-xs font-semibold text-stock-muted">相关价格</p>
```

```vue
<p class="font-mono text-xs font-semibold text-stock-muted">距离条件</p>
```

```vue
<p v-if="trigger.aiPrompt" class="mt-4 rounded bg-slate-50 p-3 text-sm leading-6 text-stock-muted">
  AI 判断：{{ trigger.aiPrompt }}
</p>
```

- [ ] **Step 5: Update home page sections**

Change `app/pages/index.vue` template headings and empty action copy:

```vue
<section class="space-y-3">
  <div class="flex items-end justify-between">
    <h3 class="text-lg font-semibold">必须处理</h3>
    <span class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">
      {{ dashboard.triggers.length }} 项
    </span>
  </div>
  <TriggerEventCard
    v-for="trigger in dashboard.triggers"
    :key="trigger.stockCode"
    :trigger="trigger"
  />
</section>

<section class="space-y-3">
  <div class="flex items-end justify-between">
    <h3 class="text-lg font-semibold">AI 持续盯盘</h3>
    <span class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">
      {{ dashboard.summary.disciplineCardCount }} 个计划
    </span>
  </div>
  <DisciplineCardRail :cards="dashboard.disciplineCards" />
</section>
```

Change the empty state button:

```vue
<van-button type="primary" icon="plus" to="/decisions/new">
  记录一个交易想法
</van-button>
```

- [ ] **Step 6: Update rail and preview language**

In `app/components/dashboard/DisciplineCardPreview.vue`, replace the small labels so users see “盯盘进度” and “查看”:

```vue
<span class="font-mono text-xs font-semibold text-stock-muted">盯盘进度</span>
```

```vue
<van-button
  class="!size-9 !rounded !p-0"
  icon="arrow"
  size="small"
  :aria-label="`查看${card.title}`"
/>
```

- [ ] **Step 7: Run dashboard tests**

Run:

```powershell
npm test -- app/test/today-dashboard.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```powershell
git add app/pages/index.vue app/components/dashboard/AiSummaryPanel.vue app/components/dashboard/TriggerEventCard.vue app/components/dashboard/DisciplineCardRail.vue app/components/dashboard/DisciplineCardPreview.vue app/test/today-dashboard.test.ts
git commit -m "feat: redesign today action dashboard"
```

---

### Task 5: Ideas, Plan Check, And Watching Pages

**Files:**
- Modify: `app/pages/decisions.vue`
- Modify: `app/pages/decisions/[id]/quality.vue`
- Modify: `app/pages/discipline-cards.vue`
- Modify: `app/pages/discipline-cards/[id].vue`
- Modify: `app/test/business-pages.test.ts`

- [ ] **Step 1: Add page language assertions**

Add this test to `app/test/business-pages.test.ts`:

```ts
  it('uses AI-first plain language across plan and watching pages', () => {
    const decisions = readFileSync(resolve(pagesRoot, 'decisions.vue'), 'utf8')
    const quality = readFileSync(resolve(pagesRoot, 'decisions/[id]/quality.vue'), 'utf8')
    const watching = readFileSync(resolve(pagesRoot, 'discipline-cards.vue'), 'utf8')
    const watchingDetail = readFileSync(resolve(pagesRoot, 'discipline-cards/[id].vue'), 'utf8')

    expect(decisions).toContain('想法与交易计划')
    expect(quality).toContain('AI 检查计划')
    expect(quality).toContain('查看盯盘')
    expect(watching).toContain('盯盘')
    expect(watchingDetail).toContain('AI 持续盯盘')
  })
```

- [ ] **Step 2: Run test and verify failure**

Run:

```powershell
npm test -- app/test/business-pages.test.ts
```

Expected: FAIL because old visible language remains.

- [ ] **Step 3: Update `decisions.vue`**

Change user-visible copy:

- Eyebrow `Decisions` -> `Ideas`
- Heading `决策` -> `想法与交易计划`
- Button `新建` -> `记录想法`
- Empty description `暂无决策记录` -> `还没有交易想法`
- Empty CTA `新建决策` -> `记录一个交易想法`
- Status label `card_created` -> `已开始盯盘`
- CTA `查看质检` -> `查看 AI 检查`

- [ ] **Step 4: Update `decisions/[id]/quality.vue`**

Change user-visible copy:

- Back aria `返回决策列表` -> `返回想法列表`
- Heading `AI 质检结果` -> `AI 检查计划`
- Error copy `质检结果暂时不可用` -> `计划检查暂时不可用`
- Loading copy `正在读取质检结果...` -> `正在读取计划检查...`
- Empty description `未找到质检结果` -> `未找到计划检查`
- Section `优势` -> `计划里清楚的部分`
- Section `脆弱点` -> `可能出问题的地方`
- Section `建议调整` -> `AI 建议你补充`
- CTA `查看纪律卡` -> `查看盯盘`
- CTA `查看纪律卡列表` -> `查看盯盘列表`

- [ ] **Step 5: Update `discipline-cards.vue`**

Change user-visible copy:

- Eyebrow `Discipline` -> `Watching`
- Heading `纪律卡` -> `盯盘`
- Error copy `纪律卡接口暂时不可用` -> `盯盘接口暂时不可用`
- Loading copy `正在加载纪律卡...` -> `正在加载盯盘计划...`
- Empty description `暂无纪律卡` -> `还没有开始盯盘的计划`
- CTA `新建决策` -> `记录交易想法`
- Labels `频率` -> `检查频率`
- Labels `下次复查` -> `下次检查`

- [ ] **Step 6: Update `discipline-cards/[id].vue`**

Change user-visible copy:

- Back aria `返回纪律卡列表` -> `返回盯盘列表`
- Eyebrow `Discipline detail` -> `Watching detail`
- Heading `纪律卡详情` -> `AI 持续盯盘`
- Error copy `纪律卡详情暂时不可用` -> `盯盘详情暂时不可用`
- Loading copy `正在加载纪律卡...` -> `正在加载盯盘计划...`
- Empty description `未找到纪律卡` -> `未找到盯盘计划`
- Section `纪律规则` -> `AI 正在盯什么`
- Cell `监控规则` -> `盯盘规则`
- Section `触发记录` -> `处理记录`
- Empty `暂无触发记录` -> `暂无处理记录`
- Section `复盘历史` -> `交易总结`
- Empty `暂无复盘` -> `暂无交易总结`

- [ ] **Step 7: Run business page tests**

Run:

```powershell
npm test -- app/test/business-pages.test.ts
```

Expected: PASS for plain-language assertions and product-term guardrail.

- [ ] **Step 8: Commit**

Run:

```powershell
git add app/pages/decisions.vue app/pages/decisions/[id]/quality.vue app/pages/discipline-cards.vue app/pages/discipline-cards/[id].vue app/test/business-pages.test.ts
git commit -m "feat: rename plans and watching surfaces"
```

---

### Task 6: Explicit Summary And Profile Surfaces

**Files:**
- Modify: `app/pages/reviews.vue`
- Modify: `app/pages/me.vue`
- Modify: `app/test/business-pages.test.ts`

- [ ] **Step 1: Update unfinished-page test**

Replace the old unfinished page assertion in `app/test/business-pages.test.ts` with:

```ts
  it('keeps unfinished summary and profile APIs explicit', () => {
    for (const file of ['reviews.vue', 'me.vue']) {
      const source = readFileSync(resolve(pagesRoot, file), 'utf8')

      expect(source).toContain('接口尚未接入')
      expect(source).not.toContain('暂无可展示')
    }
  })
```

- [ ] **Step 2: Run test and verify failure**

Run:

```powershell
npm test -- app/test/business-pages.test.ts
```

Expected: FAIL until pages use the new explicit language.

- [ ] **Step 3: Update `reviews.vue`**

Replace with:

```vue
<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <p class="text-xs font-semibold text-stock-muted">
        Summary
      </p>
      <h2 class="text-xl font-semibold">
        交易总结
      </h2>
    </div>

    <van-empty
      class="rounded-lg border border-stock-line bg-stock-surface"
      image="search"
      description="交易总结接口尚未接入。"
    >
      <p class="px-5 text-center text-sm leading-6 text-stock-muted">
        计划结束后，AI 会对照原计划和实际操作，帮你总结是否按计划执行。
      </p>
    </van-empty>
  </section>
</template>
```

- [ ] **Step 4: Update `me.vue`**

Use this user-facing skeleton:

```vue
<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <p class="text-xs font-semibold text-stock-muted">
        Profile
      </p>
      <h2 class="text-xl font-semibold">
        我的交易问题
      </h2>
    </div>

    <van-empty
      class="rounded-lg border border-stock-line bg-stock-surface"
      image="search"
      description="个人交易画像接口尚未接入。"
    >
      <p class="px-5 text-center text-sm leading-6 text-stock-muted">
        未来这里会展示 AI 从交易总结里发现的长期问题，例如止损拖延、仓位过重、理由不清。
      </p>
    </van-empty>
  </section>
</template>
```

- [ ] **Step 5: Run business tests**

Run:

```powershell
npm test -- app/test/business-pages.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```powershell
git add app/pages/reviews.vue app/pages/me.vue app/test/business-pages.test.ts
git commit -m "feat: clarify summary and profile surfaces"
```

---

### Task 7: Visual Polish And Full Verification

**Files:**
- Modify: `app/assets/css/main.css`
- Modify: any page touched earlier if visual QA finds overflow or unclear states.

- [ ] **Step 1: Update theme tokens**

In `app/assets/css/main.css`, keep Tailwind v4 `@theme` and adjust only existing token names:

```css
@theme {
  --font-sans: "Hanken Grotesk", "PingFang SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
  --color-stock-background: #f4f1ea;
  --color-stock-surface: #fffdf8;
  --color-stock-primary: #204b3a;
  --color-stock-primary-soft: #e7f1ea;
  --color-stock-text: #1e2420;
  --color-stock-muted: #68736b;
  --color-stock-line: #ddd6c8;
  --color-stock-red: #c2413a;
  --color-stock-green: #23815b;
  --color-stock-amber: #b7791f;
}
```

Also update `html:root` Vant variables to match these colors.

- [ ] **Step 2: Run typecheck and tests**

Run:

```powershell
npm test
npm run typecheck:worker
npm run build
```

Expected: all commands PASS.

- [ ] **Step 3: Run app locally for manual UI review**

Run:

```powershell
npm run dev:nuxt
```

Expected: dev server starts on `http://127.0.0.1:3000`.

Manually review:

- `/` shows 今天要处理 and AI 持续盯盘.
- `/decisions/new` supports idea input, AI追问, correction, preview, and start watching.
- `/decisions` uses 想法与交易计划 language.
- `/discipline-cards` uses 盯盘 language.
- `/reviews` explicitly says the summary API is not connected.
- `/me` explicitly says the personal profile API is not connected.

- [ ] **Step 4: Commit**

Run:

```powershell
git add app/assets/css/main.css
git commit -m "style: polish ai-first mobile UI"
```

---

## Self-Review

Spec coverage:

- AI-first positioning: Task 1, Task 3, Task 4.
- Plain-language terminology: Task 1, Task 5, Task 6.
- AI追问 and 即时纠偏: Task 2, Task 3.
- 计划预览 and 开始盯盘: Task 3.
- 今天要处理: Task 4.
- AI 持续盯盘 UI: Task 4, Task 5.
- 交易总结 and 我的交易问题 surfaces: Task 6.
- No fake production data: Task 6 keeps unimplemented pages explicit; Task 3 uses real `/decisions` submission.
- Verification: Task 7.

Placeholder scan:

- No deferred implementation markers are used.
- Real test snippets and commands are included.
- Every page listed in the file structure has a task.

Type consistency:

- `createAiPlanInterview()` returns refs/computed values used by `decisions/new.vue`.
- `preview` returns the existing `NewDecisionInput` contract.
- Existing `CreatedDecision` submission path remains unchanged.
