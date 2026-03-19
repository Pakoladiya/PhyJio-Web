import { get, set, del } from 'idb-keyval'

/** Resize + compress a File to JPEG, max 1024px, quality 0.75 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1024
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height / width) * MAX); width = MAX }
        else { width = Math.round((width / height) * MAX); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = url
  })
}

export const imageStore = {
  save:   (id: string, dataUrl: string) => set(`img_${id}`, dataUrl),
  load:   (id: string): Promise<string | undefined> => get(`img_${id}`),
  remove: (id: string) => del(`img_${id}`),
}
