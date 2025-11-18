# SpinWheel Component

- Daily spin with 24h cooldown (localStorage key: lms.spin.lastSpinAt)
- Weighted rewards: XP, Mini-Game tickets, Accessories
- Fair-play: prevents consecutive repeat of the same rare/uncommon reward
- Accessibility: ARIA-live narration, keyboard operable button
- Storage keys:
  - lms.spin.lastSpinAt (ISO string)
  - lms.spin.lastRewardId
  - lms.profile.xp (number)
  - lms.inventory.accessories (JSON array)
  - lms.tickets.minigame (number)

Usage:
- Page: /spin renders SpinPage -> SpinWheel
- Modal: WorldMapPage shows an entry with a modal when eligible
```jsx
import SpinWheel from '../components/SpinWheel';
<SpinWheel autoSpin onAfterGrant={(reward)=>console.log(reward)} />
```
