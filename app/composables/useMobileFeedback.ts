import { showConfirmDialog, showToast } from 'vant'

type ConfirmOptions = {
  title: string
  message: string
  confirmButtonText?: string
  cancelButtonText?: string
}

export function useMobileFeedback() {
  return {
    success(message: string) {
      showToast({
        type: 'success',
        message,
      })
    },
    error(message: string) {
      showToast({
        type: 'fail',
        message,
      })
    },
    loading(message: string) {
      return showToast({
        type: 'loading',
        message,
        forbidClick: true,
        duration: 0,
      })
    },
    confirm(options: ConfirmOptions) {
      return showConfirmDialog({
        title: options.title,
        message: options.message,
        confirmButtonText: options.confirmButtonText ?? '确认',
        cancelButtonText: options.cancelButtonText ?? '取消',
      })
    },
  }
}
