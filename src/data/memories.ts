export type MemoryPhoto = {
  id: number
  label: string
  caption: string
  hiddenMessage: string
  frame: 'polaroid' | 'heart' | 'circle' | 'film' | 'torn' | 'rounded' | 'booth' | 'amoeba' | 'wiggly'
  color: string
  position: string
  src: string
}

export const memories: MemoryPhoto[] = [
  { id: 1, label: 'Our little moment', caption: 'My favourite kind of memory.', hiddenMessage: 'I promise to keep choosing you, in every ordinary and wonderful moment.', frame: 'heart', color: '#fbe4ea', position: 'center', src: '/img2.JPG' },
  { id: 2, label: 'A perfect day', caption: 'You make every day softer.', hiddenMessage: 'You are my favourite person and my safest place. Always.', frame: 'wiggly', color: '#f7d8dc', position: 'center', src: '/img1.JPG' },
  { id: 4, label: 'My favourite view', caption: 'Proof that you are very lovable.', hiddenMessage: 'I am so proud of you and everything you are becoming.', frame: 'amoeba', color: '#eae4f8', position: 'center', src: '/img3.JPG' },
  { id: 5, label: 'A warm memory', caption: 'My heart remembers this one.', hiddenMessage: 'Promise me you will always remember how deeply you are loved.', frame: 'rounded', color: '#fbe4ea', position: 'center', src: '/img5.JPG' },
  { id: 6, label: 'Our kind of happy', caption: 'A little chaos, a lot of love.', hiddenMessage: 'You are brilliant, beautiful, and completely impossible not to adore.', frame: 'polaroid', color: '#f5e6ff', position: 'center', src: '/img6.JPG' },
  { id: 7, label: 'Forever favourite', caption: 'The best part is still you.', hiddenMessage: 'I promise to celebrate you, support you, and be your biggest fan.', frame: 'torn', color: '#e6f3fa', position: 'center', src: '/img7.JPG' },
]
