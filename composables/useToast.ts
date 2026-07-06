export function useToast() {
  const message = useState<string>('toast', () => '')
  let timer: ReturnType<typeof setTimeout> | null = null

  function toast(m: string) {
    message.value = m
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => (message.value = ''), 2200)
  }

  return { message, toast }
}
