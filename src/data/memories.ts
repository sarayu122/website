export type MemoryPhoto = {
  id: number
  label: string
  caption: string
  hiddenMessage: string
  frame: 'polaroid' | 'heart' | 'circle' | 'film' | 'torn' | 'rounded' | 'booth'
  color: string
  position: string
  src: string
}

const makePhoto = (
  id: number,
  label: string,
  caption: string,
  hiddenMessage: string,
  frame: MemoryPhoto['frame'],
  color: string,
  position: string,
) => ({
  id,
  label,
  caption,
  hiddenMessage,
  frame,
  color,
  position,
  src: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="100%" stop-color="#fffdf9" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#bg)"/>
      <circle cx="600" cy="520" r="220" fill="#fbe4ea" opacity="0.9"/>
      <circle cx="470" cy="470" r="120" fill="#f0d6eb" opacity="0.9"/>
      <circle cx="710" cy="484" r="132" fill="#e6f3fa" opacity="0.95"/>
      <rect x="300" y="740" width="600" height="120" rx="28" fill="#594b50" opacity="0.15"/>
      <text x="600" y="815" text-anchor="middle" font-size="92" font-family="Arial, sans-serif" fill="#594b50" font-weight="700">${label}</text>
    </svg>
  `)}`,
})

export const memories: MemoryPhoto[] = [
  makePhoto(1, 'Our Photo 1', 'My favourite human, unfortunately.', 'Wait, I said I was going to be annoyed and then you smiled.', 'polaroid', '#fbe4ea', '50% 38%'),
  makePhoto(2, 'Our Photo 2', 'This moment has my whole heart.', 'You make ordinary days feel like magic.', 'heart', '#eae4f8', '48% 40%'),
  makePhoto(3, 'Our Photo 3', 'Proof that I tolerate you.', 'A little chaos, a lot of love, and you still win.', 'circle', '#e6f3fa', '58% 42%'),
  makePhoto(4, 'Our Photo 4', 'I wish I could replay this day.', 'Some memories are sweet enough to live in my head forever.', 'film', '#f7d8dc', '44% 39%'),
  makePhoto(5, 'Our Photo 5', 'Us being us.', 'The best part of life is being your favourite person.', 'rounded', '#eae4f8', '50% 46%'),
  makePhoto(6, 'Our Photo 6', 'The face that keeps me smiling.', 'You are still the best part of my day, every single day.', 'torn', '#fbe4ea', '55% 45%'),
  makePhoto(7, 'Our Photo 7', 'A tiny piece of our forever.', 'Everything feels softer when I’m with you.', 'booth', '#e6f3fa', '50% 40%'),
  makePhoto(8, 'Our Photo 8', 'My favourite place is beside you.', 'I still choose your hand in mine every time.', 'polaroid', '#f7d8dc', '53% 46%'),
  makePhoto(9, 'Our Photo 9', 'Your smile is my favourite sound.', 'It still makes my heart skip a beat.', 'heart', '#f5e6ff', '50% 44%'),
  makePhoto(10, 'Our Photo 10', 'The cutest kind of chaos.', 'I love how our life feels easy when we’re together.', 'circle', '#eaf6ff', '49% 43%'),
  makePhoto(11, 'Our Photo 11', 'My person.', 'You are my comfort, my joy, and my favourite hello.', 'film', '#fbe4ea', '52% 48%'),
  makePhoto(12, 'Our Photo 12', 'Still the best decision ever.', 'No matter the day, I’m grateful for you.', 'rounded', '#eae4f8', '48% 42%'),
  makePhoto(13, 'Our Photo 13', 'When life is softer with you.', 'I keep collecting tiny memories because they all lead back to you.', 'torn', '#e6f3fa', '52% 41%'),
  makePhoto(14, 'Our Photo 14', 'Sure, I like you a little too much.', 'I’d love to replay every smile we’ve shared.', 'booth', '#f7d8dc', '46% 44%'),
  makePhoto(15, 'Our Photo 15', 'You are my favourite person.', 'Even the quiet moments feel warm when you’re there.', 'polaroid', '#eae4f8', '50% 38%'),
  makePhoto(16, 'Our Photo 16', 'You are my peace.', 'Some days, my heart just says home.', 'heart', '#fbe4ea', '49% 43%'),
  makePhoto(17, 'Our Photo 17', 'Tiny celebration, giant love.', 'The best memories are the ones we make together.', 'circle', '#e6f3fa', '51% 40%'),
  makePhoto(18, 'Our Photo 18', 'Happy us.', 'The love in our story keeps getting sweeter.', 'film', '#f5dfe9', '58% 46%'),
  makePhoto(19, 'Our Photo 19', 'You make everything brighter.', 'If I could relive these moments, I’d choose all of them with you.', 'rounded', '#fbe4ea', '47% 41%'),
  makePhoto(20, 'Our Photo 20', 'A little love, a lot of laughter.', 'The world feels gentler when it’s shared with you.', 'booth', '#eae4f8', '50% 45%'),
]
