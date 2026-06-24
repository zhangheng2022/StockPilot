<script setup lang="ts">
import type { CreatedDecision, DecisionAction, NewDecisionInput } from '../../types/decisions'

const router = useRouter()
const feedback = useMobileFeedback()
const submitting = ref(false)
const submitError = ref('')

const form = reactive<NewDecisionInput>({
  stockCode: '',
  stockName: '',
  action: 'hold',
  rationale: '',
  evidence: '',
  risk: '',
  plannedPosition: 0.1,
  invalidationCondition: '',
  exitCondition: '',
})

const actionOptions: Array<{ label: string, value: DecisionAction }> = [
  { label: '买入', value: 'buy' },
  { label: '加仓', value: 'add' },
  { label: '减仓', value: 'reduce' },
  { label: '持有', value: 'hold' },
  { label: '卖出', value: 'sell' },
]

function positionLabel() {
  return `${Math.round(form.plannedPosition * 100)}%`
}

async function submitDecision() {
  submitError.value = ''
  submitting.value = true
  const toast = feedback.loading('正在生成质检...')

  try {
    const result = await apiRequest<CreatedDecision>('/decisions', {
      method: 'POST',
      body: form,
    })
    feedback.success('决策已生成')
    await router.push({
      path: `/decisions/${result.decision.id}/quality`,
      query: {
        cardId: result.disciplineCard.id,
      },
    })
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : '保存失败'
    feedback.error(submitError.value)
  } finally {
    toast.close()
    submitting.value = false
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center gap-2">
      <van-button
        icon="arrow-left"
        size="small"
        plain
        hairline
        to="/decisions"
        aria-label="返回决策列表"
      />
      <div>
        <p class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">
          New decision
        </p>
        <h2 class="text-xl font-semibold">
          新建决策
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

    <van-form
      class="space-y-4"
      @submit="submitDecision"
    >
      <van-cell-group inset>
        <van-field
          v-model="form.stockCode"
          name="stockCode"
          label="代码"
          placeholder="例如 00700"
          :rules="[{ required: true, message: '请输入股票代码' }]"
        />
        <van-field
          v-model="form.stockName"
          name="stockName"
          label="名称"
          placeholder="例如 Tencent"
          :rules="[{ required: true, message: '请输入股票名称' }]"
        />
        <van-field
          name="action"
          label="动作"
        >
          <template #input>
            <van-radio-group
              v-model="form.action"
              direction="horizontal"
            >
              <van-radio
                v-for="item in actionOptions"
                :key="item.value"
                :name="item.value"
              >
                {{ item.label }}
              </van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          name="plannedPosition"
          label="计划仓位"
        >
          <template #input>
            <div class="w-full space-y-2">
              <div class="flex justify-between font-mono text-xs text-stock-muted">
                <span>0%</span>
                <strong class="text-stock-text">{{ positionLabel() }}</strong>
                <span>100%</span>
              </div>
              <van-slider
                v-model="form.plannedPosition"
                :min="0"
                :max="1"
                :step="0.01"
                bar-height="4px"
              />
            </div>
          </template>
        </van-field>
      </van-cell-group>

      <van-cell-group inset>
        <van-field
          v-model="form.rationale"
          name="rationale"
          label="核心逻辑"
          type="textarea"
          autosize
          rows="2"
          placeholder="这笔交易为什么值得跟踪"
          :rules="[{ required: true, message: '请输入核心逻辑' }]"
        />
        <van-field
          v-model="form.evidence"
          name="evidence"
          label="证据"
          type="textarea"
          autosize
          rows="2"
          placeholder="价格、量能、财务或事件证据"
          :rules="[{ required: true, message: '请输入证据' }]"
        />
        <van-field
          v-model="form.risk"
          name="risk"
          label="风险"
          type="textarea"
          autosize
          rows="2"
          placeholder="最可能错在哪里"
          :rules="[{ required: true, message: '请输入风险' }]"
        />
      </van-cell-group>

      <van-cell-group inset>
        <van-field
          v-model="form.invalidationCondition"
          name="invalidationCondition"
          label="失效条件"
          type="textarea"
          autosize
          rows="2"
          placeholder="什么发生后必须停止原计划"
          :rules="[{ required: true, message: '请输入失效条件' }]"
        />
        <van-field
          v-model="form.exitCondition"
          name="exitCondition"
          label="退出条件"
          type="textarea"
          autosize
          rows="2"
          placeholder="止盈、止损或复盘后的退出规则"
          :rules="[{ required: true, message: '请输入退出条件' }]"
        />
      </van-cell-group>

      <van-button
        block
        type="primary"
        native-type="submit"
        icon="passed"
        :loading="submitting"
      >
        生成 AI 质检
      </van-button>
    </van-form>
  </section>
</template>
