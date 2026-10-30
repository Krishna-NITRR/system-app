# Video generation prompt: 1:1 Research Mentorship promo

A 30-second vertical ad for `/mentorship`, built from the Mentorship Sales Blueprint.
The video names one blocker, shows the ₹399 offer, and ends with one CTA.

Works with Veo, Sora, Runway Gen-4, Kling or Pika. Generate each shot as its own clip
(most tools cap clips at 5–10 s), then put the on-screen text and voiceover on top in an
editor (CapCut, Premiere, Canva). AI video models still render text badly, so keep text out
of the generated frames.

**Rules taken from the audit. Keep them in every variation:**
- No testimonials, reviews, star ratings or quotes from students.
- Never promise selection, an internship, a publication, or "guaranteed" results.
- No fake scarcity ("only 3 slots left", "exclusive").
- Don't generate Krishna's face. Use hands, screens and over-the-shoulder shots. If you want
  him on camera, film a real 5-second clip and cut it in.

---

## 1. Master prompt (paste this first for style consistency)

> Vertical 9:16 short-form ad, 30 seconds, cinematic but natural, shot like a modern
> documentary on a 35mm lens with shallow depth of field. Setting: an Indian engineering
> college hostel room and a quiet campus library in the evening. Subject: a 20-year-old
> Indian undergraduate student (gender-neutral styling, casual hoodie), seen mostly from
> behind, over the shoulder, or as hands on a laptop. The face is never the focus. Colour
> palette: soft warm desk-lamp light against cool blue laptop glow, with accents of violet
> (#6C4CF1). Mood moves from tense and stuck to calm and clear. Slow, steady camera
> moves, no fast cuts, no glitch effects. Realistic textures, no text or logos in frame,
> no watermarks.

**Negative prompt** (for tools that accept one):
> text, captions, subtitles, logos, watermarks, distorted hands, extra fingers, warped
> laptop screens, readable UI text, faces in close-up, celebrities, university logos,
> trophies, graduation caps, money, stock-market charts, neon cyberpunk, over-saturated
> colours, fast zooms, shaky cam

---

## 2. Shot list

| # | Time | Shot prompt (append to the master prompt) | On-screen text (add in editor) |
|---|------|------------------------------------------|--------------------------------|
| 1 | 0–4 s | Close-up of a laptop screen at night glowing in a dark hostel room, a blurred email inbox, the cursor hovering over a "Sent" folder. The camera pushes in slowly. A phone beside it lights up with no notification. | **12 professors emailed. 1 reply.** |
| 2 | 4–8 s | Over-the-shoulder shot of the student, head in hands, in front of a laptop with many browser tabs open. Sticky notes on the wall, a calendar with one date circled in red marker. Desk-lamp light. | **Deadline in 9 days. 20 tabs open. No plan.** |
| 3 | 8–12 s | A top-down shot of a desk: a printed CV covered in pencil marks, a notebook, chai in a steel glass. A hand picks up a pen, then puts it back down, unsure. | **It's not a lack of information. It's knowing what to do next.** |
| 4 | 12–17 s | Medium shot: the student sits up, puts on earphones and joins a video call on the laptop (the screen shows a soft, blurred call layout, no readable UI). Warm light comes up gently. The student nods and starts writing in the notebook. | **30 minutes. One problem. 1:1 on Google Meet.** |
| 5 | 17–22 s | Close-up of the hand writing a numbered list in a notebook: three short lines, then a firm underline. Cut to the laptop, where an email draft is edited and the cursor moves to "Send". | **Leave with a decision, a priority order, and the first step.** |
| 6 | 22–26 s | Morning light through a window. The student, fresh and calm, reads a short document on a phone (blurred) while walking through a campus corridor. Slow tracking shot from behind. | **Your written plan, within 24 hours.** |
| 7 | 26–30 s | Final wide shot: the same desk, now tidy, the laptop closed, the notebook open to the list. Soft violet light fades in at the edges. Hold for a clean end frame with space for text at the top and bottom. | **1:1 Research Mentorship · ₹399 · no subscription**<br>**krishnamahawar.in/mentorship** |

---

## 3. Voiceover script (about 70 words, calm and direct, Indian-English accent)

> Twelve professors emailed. One reply.
> A deadline next week, twenty tabs open, and still no plan.
>
> The problem isn't information. It's deciding what to do next.
>
> Bring me one problem: which professors to email, why nobody replies, what to fix in your CV.
> In thirty minutes we decide what to do. Within twenty-four hours, you get it in writing.
>
> One-on-one research mentorship. Three ninety-nine. No subscription.
> Link's on the page.

Optional VO prompt for AI voice tools (ElevenLabs etc.):
> Young adult male voice, Indian English, warm, unhurried, conversational, like a senior
> talking to a junior in the hostel corridor. No hype, no announcer tone.

---

## 4. Music

> Minimal lo-fi piano with a soft pulse. It starts sparse and slightly tense (single notes),
> and from shot 4 a gentle warm pad and light beat come in. 70–80 BPM, no vocals, ends on
> a resolved chord at 30 s.

---

## 5. Cut-downs

- **15 s (Reels / Shorts):** shots 1, 2, 4, 5, 7. Use VO lines 1, 4 and 6.
- **6 s bumper:** shot 5 into shot 7, with the text "Stuck on a research internship? 30 min · ₹399".
- **Square 1:1 (LinkedIn feed):** same shots; ask for "1:1 square framing, subject centred" in the master prompt.

## 6. Captions and tracking

- Burn in captions. Most viewers watch muted.
- Link every post with UTM parameters so bookings get attributed, for example:
  `https://www.krishnamahawar.in/mentorship?utm_source=linkedin&utm_medium=video&utm_campaign=mentorship_promo_v1`
  The booking form stores these with each booking.
