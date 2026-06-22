# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: astroplan.spec.ts >> AstroPlan App >> settings persist in localStorage
- Location: tests\astroplan.spec.ts:67:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="password"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - heading "✦ AstroPlan" [level=1] [ref=e6]
          - paragraph [ref=e7]: Milky Way Photography Planner
        - button "⚙️" [active] [ref=e8]
      - generic [ref=e10]:
        - textbox "Enter place name (e.g., Chiang Mai)" [ref=e12]
        - button "🔍" [ref=e13]
        - button "📡" [ref=e14]
      - generic [ref=e16]: 🌤 Live weather (Open-Meteo)
      - generic [ref=e17]:
        - button "‹" [ref=e18]
        - generic [ref=e19]:
          - generic [ref=e20]: June 2026
          - paragraph [ref=e21]: ★ 12 good shooting days this month
        - button "›" [ref=e22]
      - generic [ref=e23]:
        - generic [ref=e24]: GC Rise
        - generic [ref=e26]: GC Set
        - generic [ref=e28]: Moon Bright
        - generic [ref=e30]: Dark Sky
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: Sun
          - generic [ref=e35]: Mon
          - generic [ref=e36]: Tue
          - generic [ref=e37]: Wed
          - generic [ref=e38]: Thu
          - generic [ref=e39]: Fri
          - generic [ref=e40]: Sat
        - generic [ref=e41]:
          - button "Day 31, moon level 10, cloud no data" [ref=e42] [cursor=pointer]:
            - generic [ref=e43]: "31"
            - generic [ref=e44]:
              - generic [ref=e47]: 14:59
              - generic [ref=e50]: 01:57
              - generic [ref=e52]: ☁ —
            - img:
              - generic [ref=e53]: E
              - generic [ref=e54]: S
              - generic [ref=e55]: W
          - button "Day 1, moon level 10, cloud no data" [ref=e57] [cursor=pointer]:
            - generic [ref=e59]: "1"
            - generic [ref=e60]:
              - generic [ref=e63]: 14:55
              - generic [ref=e66]: 01:53
              - generic [ref=e68]: ☁ —
            - img:
              - generic [ref=e69]: E
              - generic [ref=e70]: S
              - generic [ref=e71]: W
          - button "Day 2, moon level 10, cloud no data" [ref=e73] [cursor=pointer]:
            - generic [ref=e74]: "2"
            - generic [ref=e75]:
              - generic [ref=e78]: 14:51
              - generic [ref=e81]: 01:49
              - generic [ref=e83]: ☁ —
            - img:
              - generic [ref=e84]: E
              - generic [ref=e85]: S
              - generic [ref=e86]: W
          - button "Day 3, moon level 10, cloud no data" [ref=e88] [cursor=pointer]:
            - generic [ref=e89]: "3"
            - generic [ref=e90]:
              - generic [ref=e93]: 14:48
              - generic [ref=e96]: 01:45
              - generic [ref=e98]: ☁ —
            - img:
              - generic [ref=e99]: E
              - generic [ref=e100]: S
              - generic [ref=e101]: W
          - button "Day 4, moon level 9, cloud no data" [ref=e103] [cursor=pointer]:
            - generic [ref=e104]: "4"
            - generic [ref=e105]:
              - generic [ref=e108]: 14:44
              - generic [ref=e111]: 01:41
              - generic [ref=e113]: ☁ —
            - img:
              - generic [ref=e114]: E
              - generic [ref=e115]: S
              - generic [ref=e116]: W
          - button "Day 5, moon level 9, cloud no data" [ref=e118] [cursor=pointer]:
            - generic [ref=e119]: "5"
            - generic [ref=e120]:
              - generic [ref=e123]: 14:40
              - generic [ref=e126]: 01:37
              - generic [ref=e128]: ☁ —
            - img:
              - generic [ref=e129]: E
              - generic [ref=e130]: S
              - generic [ref=e131]: W
          - button "Day 6, moon level 8, cloud no data" [ref=e133] [cursor=pointer]:
            - generic [ref=e134]: "6"
            - generic [ref=e135]:
              - generic [ref=e138]: 14:36
              - generic [ref=e141]: 01:33
              - generic [ref=e143]: ☁ —
            - img:
              - generic [ref=e144]: E
              - generic [ref=e145]: S
              - generic [ref=e146]: W
          - button "Day 7, moon level 7, cloud no data" [ref=e148] [cursor=pointer]:
            - generic [ref=e149]: "7"
            - generic [ref=e150]:
              - generic [ref=e153]: 14:32
              - generic [ref=e156]: 01:30
              - generic [ref=e158]: ☁ —
            - img:
              - generic [ref=e159]: E
              - generic [ref=e160]: S
              - generic [ref=e161]: W
          - button "Day 8, moon level 6, cloud no data" [ref=e163] [cursor=pointer]:
            - generic [ref=e164]: "8"
            - generic [ref=e165]:
              - generic [ref=e168]: 14:28
              - generic [ref=e171]: 01:26
              - generic [ref=e173]: ☁ —
            - img:
              - generic [ref=e174]: E
              - generic [ref=e175]: S
              - generic [ref=e176]: W
          - button "Day 9, moon level 5, cloud no data" [ref=e178] [cursor=pointer]:
            - generic [ref=e179]: "9"
            - generic [ref=e180]:
              - generic [ref=e183]: 14:24
              - generic [ref=e186]: 01:22
              - generic [ref=e188]: ☁ —
            - img:
              - generic [ref=e189]: E
              - generic [ref=e190]: S
              - generic [ref=e191]: W
          - button "Day 10, moon level 4, cloud no data" [ref=e193] [cursor=pointer]:
            - generic [ref=e194]: "10"
            - generic [ref=e195]: ★
            - generic [ref=e196]:
              - generic [ref=e199]: 14:20
              - generic [ref=e202]: 01:18
              - generic [ref=e204]: ☁ —
            - img:
              - generic [ref=e205]: E
              - generic [ref=e206]: S
              - generic [ref=e207]: W
          - button "Day 11, moon level 3, cloud no data" [ref=e209] [cursor=pointer]:
            - generic [ref=e210]: "11"
            - generic [ref=e211]: ★
            - generic [ref=e212]:
              - generic [ref=e215]: 14:16
              - generic [ref=e218]: 01:14
              - generic [ref=e220]: ☁ —
            - img:
              - generic [ref=e221]: E
              - generic [ref=e222]: S
              - generic [ref=e223]: W
          - button "Day 12, moon level 2, cloud no data" [ref=e225] [cursor=pointer]:
            - generic [ref=e226]: "12"
            - generic [ref=e227]: ★
            - generic [ref=e228]:
              - generic [ref=e231]: 14:12
              - generic [ref=e234]: 01:10
              - generic [ref=e236]: ☁ —
            - img:
              - generic [ref=e237]: E
              - generic [ref=e238]: S
              - generic [ref=e239]: W
          - button "Day 13, moon level 1, cloud no data" [ref=e241] [cursor=pointer]:
            - generic [ref=e242]: "13"
            - generic [ref=e243]: ★
            - generic [ref=e244]:
              - generic [ref=e247]: 14:08
              - generic [ref=e250]: 01:06
              - generic [ref=e252]: ☁ —
            - img:
              - generic [ref=e253]: E
              - generic [ref=e254]: S
              - generic [ref=e255]: W
          - button "Day 14, moon level 1, cloud no data" [ref=e257] [cursor=pointer]:
            - generic [ref=e258]: "14"
            - generic [ref=e259]: ★
            - generic [ref=e260]:
              - generic [ref=e263]: 14:04
              - generic [ref=e266]: 01:02
              - generic [ref=e268]: ☁ —
            - img:
              - generic [ref=e269]: E
              - generic [ref=e270]: S
              - generic [ref=e271]: W
          - button "Day 15, moon level 1, cloud no data" [ref=e273] [cursor=pointer]:
            - generic [ref=e274]: "15"
            - generic [ref=e275]: ★
            - generic [ref=e276]:
              - generic [ref=e279]: 14:00
              - generic [ref=e282]: 00:58
              - generic [ref=e284]: ☁ —
            - img:
              - generic [ref=e285]: E
              - generic [ref=e286]: S
              - generic [ref=e287]: W
          - button "Day 16, moon level 1, cloud no data" [ref=e289] [cursor=pointer]:
            - generic [ref=e290]: "16"
            - generic [ref=e291]: ★
            - generic [ref=e292]:
              - generic [ref=e295]: 13:56
              - generic [ref=e298]: 00:54
              - generic [ref=e300]: ☁ —
            - img:
              - generic [ref=e301]: E
              - generic [ref=e302]: S
              - generic [ref=e303]: W
          - button "Day 17, moon level 1, cloud no data" [ref=e305] [cursor=pointer]:
            - generic [ref=e306]: "17"
            - generic [ref=e307]: ★
            - generic [ref=e308]:
              - generic [ref=e311]: 13:52
              - generic [ref=e314]: 00:50
              - generic [ref=e316]: ☁ —
            - img:
              - generic [ref=e317]: E
              - generic [ref=e318]: S
              - generic [ref=e319]: W
          - button "Day 18, moon level 1, cloud no data" [ref=e321] [cursor=pointer]:
            - generic [ref=e322]: "18"
            - generic [ref=e323]: ★
            - generic [ref=e324]:
              - generic [ref=e327]: 13:48
              - generic [ref=e330]: 00:46
              - generic [ref=e332]: ☁ —
            - img:
              - generic [ref=e333]: E
              - generic [ref=e334]: S
              - generic [ref=e335]: W
          - button "Day 19, moon level 2, cloud no data" [ref=e337] [cursor=pointer]:
            - generic [ref=e338]: "19"
            - generic [ref=e339]: ★
            - generic [ref=e340]:
              - generic [ref=e343]: 13:44
              - generic [ref=e346]: 00:42
              - generic [ref=e348]: ☁ —
            - img:
              - generic [ref=e349]: E
              - generic [ref=e350]: S
              - generic [ref=e351]: W
          - button "Day 20, moon level 3, cloud no data" [ref=e353] [cursor=pointer]:
            - generic [ref=e354]: "20"
            - generic [ref=e355]: ★
            - generic [ref=e356]:
              - generic [ref=e359]: 13:41
              - generic [ref=e362]: 00:38
              - generic [ref=e364]: ☁ —
            - img:
              - generic [ref=e365]: E
              - generic [ref=e366]: S
              - generic [ref=e367]: W
          - button "Day 21, moon level 4, cloud no data" [ref=e369] [cursor=pointer]:
            - generic [ref=e370]: "21"
            - generic [ref=e371]: ★
            - generic [ref=e372]:
              - generic [ref=e375]: 13:37
              - generic [ref=e378]: 00:34
              - generic [ref=e380]: ☁ —
            - img:
              - generic [ref=e381]: E
              - generic [ref=e382]: S
              - generic [ref=e383]: W
          - button "Day 22, moon level 5, cloud 95% (today)" [ref=e385] [cursor=pointer]:
            - generic [ref=e386]: "22"
            - generic [ref=e387]: ★
            - generic [ref=e388]:
              - generic [ref=e391]: 13:33
              - generic [ref=e394]: 00:30
              - generic [ref=e395]:
                - generic [ref=e396]: ☁ 95%
                - generic "Live weather data" [ref=e397]: ●
            - img:
              - generic [ref=e398]: E
              - generic [ref=e399]: S
              - generic [ref=e400]: W
          - button "Day 23, moon level 6, cloud 53%" [ref=e402] [cursor=pointer]:
            - generic [ref=e403]: "23"
            - generic [ref=e404]: ★
            - generic [ref=e405]:
              - generic [ref=e408]: 13:29
              - generic [ref=e411]: 00:26
              - generic [ref=e412]:
                - generic [ref=e413]: ☁ 53%
                - generic "Live weather data" [ref=e414]: ●
            - img:
              - generic [ref=e415]: E
              - generic [ref=e416]: S
              - generic [ref=e417]: W
          - button "Day 24, moon level 7, cloud 44%" [ref=e419] [cursor=pointer]:
            - generic [ref=e420]: "24"
            - generic [ref=e421]:
              - generic [ref=e424]: 13:25
              - generic [ref=e427]: 00:23
              - generic [ref=e428]:
                - generic [ref=e429]: ☁ 44%
                - generic "Live weather data" [ref=e430]: ●
            - img:
              - generic [ref=e431]: E
              - generic [ref=e432]: S
              - generic [ref=e433]: W
          - button "Day 25, moon level 8, cloud 71%" [ref=e435] [cursor=pointer]:
            - generic [ref=e436]: "25"
            - generic [ref=e437]:
              - generic [ref=e440]: 13:21
              - generic [ref=e443]: 00:19
              - generic [ref=e444]:
                - generic [ref=e445]: ☁ 71%
                - generic "Live weather data" [ref=e446]: ●
            - img:
              - generic [ref=e447]: E
              - generic [ref=e448]: S
              - generic [ref=e449]: W
          - button "Day 26, moon level 9, cloud 88%" [ref=e451] [cursor=pointer]:
            - generic [ref=e452]: "26"
            - generic [ref=e453]:
              - generic [ref=e456]: 13:17
              - generic [ref=e459]: 00:15
              - generic [ref=e460]:
                - generic [ref=e461]: ☁ 88%
                - generic "Live weather data" [ref=e462]: ●
            - img:
              - generic [ref=e463]: E
              - generic [ref=e464]: S
              - generic [ref=e465]: W
          - button "Day 27, moon level 10, cloud 95%" [ref=e467] [cursor=pointer]:
            - generic [ref=e468]: "27"
            - generic [ref=e469]:
              - generic [ref=e472]: 13:13
              - generic [ref=e475]: 00:11
              - generic [ref=e476]:
                - generic [ref=e477]: ☁ 95%
                - generic "Live weather data" [ref=e478]: ●
            - img:
              - generic [ref=e479]: E
              - generic [ref=e480]: S
              - generic [ref=e481]: W
          - button "Day 28, moon level 10, cloud 88%" [ref=e483] [cursor=pointer]:
            - generic [ref=e484]: "28"
            - generic [ref=e485]:
              - generic [ref=e488]: 13:09
              - generic [ref=e491]: 00:07
              - generic [ref=e492]:
                - generic [ref=e493]: ☁ 88%
                - generic "Live weather data" [ref=e494]: ●
            - img:
              - generic [ref=e495]: E
              - generic [ref=e496]: S
              - generic [ref=e497]: W
          - button "Day 29, moon level 10, cloud no data" [ref=e499] [cursor=pointer]:
            - generic [ref=e500]: "29"
            - generic [ref=e501]:
              - generic [ref=e504]: 13:05
              - generic [ref=e507]: 00:03
              - generic [ref=e509]: ☁ —
            - img:
              - generic [ref=e510]: E
              - generic [ref=e511]: S
              - generic [ref=e512]: W
          - button "Day 30, moon level 10, cloud no data" [ref=e514] [cursor=pointer]:
            - generic [ref=e515]: "30"
            - generic [ref=e516]:
              - generic [ref=e519]: 13:01
              - generic [ref=e522]: 23:59
              - generic [ref=e524]: ☁ —
            - img:
              - generic [ref=e525]: E
              - generic [ref=e526]: S
              - generic [ref=e527]: W
          - button "Day 1, moon level 10, cloud no data" [ref=e529] [cursor=pointer]:
            - generic [ref=e531]: "1"
            - generic [ref=e532]:
              - generic [ref=e535]: 12:57
              - generic [ref=e538]: 23:55
              - generic [ref=e540]: ☁ —
            - img:
              - generic [ref=e541]: E
              - generic [ref=e542]: S
              - generic [ref=e543]: W
          - button "Day 2, moon level 10, cloud no data" [ref=e545] [cursor=pointer]:
            - generic [ref=e546]: "2"
            - generic [ref=e547]:
              - generic [ref=e550]: 12:53
              - generic [ref=e553]: 23:51
              - generic [ref=e555]: ☁ —
            - img:
              - generic [ref=e556]: E
              - generic [ref=e557]: S
              - generic [ref=e558]: W
          - button "Day 3, moon level 10, cloud no data" [ref=e560] [cursor=pointer]:
            - generic [ref=e561]: "3"
            - generic [ref=e562]:
              - generic [ref=e565]: 12:49
              - generic [ref=e568]: 23:47
              - generic [ref=e570]: ☁ —
            - img:
              - generic [ref=e571]: E
              - generic [ref=e572]: S
              - generic [ref=e573]: W
          - button "Day 4, moon level 9, cloud no data" [ref=e575] [cursor=pointer]:
            - generic [ref=e576]: "4"
            - generic [ref=e577]:
              - generic [ref=e580]: 12:45
              - generic [ref=e583]: 23:43
              - generic [ref=e585]: ☁ —
            - img:
              - generic [ref=e586]: E
              - generic [ref=e587]: S
              - generic [ref=e588]: W
      - generic [ref=e590]:
        - heading "🏆 Best Shooting Days" [level=3] [ref=e591]
        - generic [ref=e592]:
          - button "🥇 2026-06-13 14:08–01:06 🌙8% 76" [ref=e593]:
            - generic [ref=e594]:
              - generic [ref=e595]: 🥇
              - generic [ref=e596]: 2026-06-13
              - generic [ref=e597]: 14:08–01:06
            - generic [ref=e598]:
              - generic [ref=e599]: 🌙8%
              - generic [ref=e600]: "76"
          - button "🥈 2026-06-14 14:04–01:02 🌙3% 76" [ref=e601]:
            - generic [ref=e602]:
              - generic [ref=e603]: 🥈
              - generic [ref=e604]: 2026-06-14
              - generic [ref=e605]: 14:04–01:02
            - generic [ref=e606]:
              - generic [ref=e607]: 🌙3%
              - generic [ref=e608]: "76"
          - button "🥉 2026-06-15 14:00–00:58 🌙0% 76" [ref=e609]:
            - generic [ref=e610]:
              - generic [ref=e611]: 🥉
              - generic [ref=e612]: 2026-06-15
              - generic [ref=e613]: 14:00–00:58
            - generic [ref=e614]:
              - generic [ref=e615]: 🌙0%
              - generic [ref=e616]: "76"
          - button "4. 2026-06-16 13:56–00:54 🌙1% 76" [ref=e617]:
            - generic [ref=e618]:
              - generic [ref=e619]: "4."
              - generic [ref=e620]: 2026-06-16
              - generic [ref=e621]: 13:56–00:54
            - generic [ref=e622]:
              - generic [ref=e623]: 🌙1%
              - generic [ref=e624]: "76"
          - button "5. 2026-06-17 13:52–00:50 🌙4% 76" [ref=e625]:
            - generic [ref=e626]:
              - generic [ref=e627]: "5."
              - generic [ref=e628]: 2026-06-17
              - generic [ref=e629]: 13:52–00:50
            - generic [ref=e630]:
              - generic [ref=e631]: 🌙4%
              - generic [ref=e632]: "76"
      - generic [ref=e635]:
        - generic [ref=e636]:
          - generic [ref=e637]: 🔔
          - generic [ref=e638]:
            - paragraph [ref=e639]: Shooting Alerts
            - paragraph [ref=e640]: "Off"
        - button [ref=e641]
    - generic [ref=e644]:
      - generic [ref=e645]:
        - heading "⚙️ Settings" [level=2] [ref=e646]
        - button "×" [ref=e647]
      - generic [ref=e648]:
        - generic [ref=e649]:
          - generic [ref=e650]: Default Location
          - generic [ref=e651]:
            - generic [ref=e652]:
              - generic [ref=e653]: Latitude
              - spinbutton [ref=e654]: "13.7563"
            - generic [ref=e655]:
              - generic [ref=e656]: Longitude
              - spinbutton [ref=e657]: "100.5018"
        - generic [ref=e658]:
          - generic [ref=e659]: Timezone
          - combobox [ref=e660]:
            - option "Bangkok (UTC+7)" [selected]
            - option "Chiang Mai (UTC+7)"
            - option "Phuket (UTC+7)"
            - option "Tokyo (UTC+9)"
            - option "Sydney (UTC+10/+11)"
            - option "London (UTC+0/+1)"
            - option "Los Angeles (UTC-8/-7)"
            - option "New York (UTC-5/-4)"
        - generic [ref=e661]:
          - generic [ref=e662]:
            - generic [ref=e663]: Auto-detect location
            - generic [ref=e664]: Use GPS on app start
          - button [ref=e665]
        - paragraph [ref=e668]: 🌤 Weather data from Open-Meteo (free, no API key)
        - generic [ref=e670]:
          - paragraph [ref=e671]: AstroPlan v0.1.0
          - paragraph [ref=e672]: Milky Way Photography Planner
          - paragraph [ref=e673]: Built with Next.js + SunCalc
        - button "Save Settings" [ref=e674]
  - button "Open Next.js Dev Tools" [ref=e680] [cursor=pointer]:
    - img [ref=e681]
  - alert [ref=e684]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('AstroPlan App', () => {
  4   | 
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await page.goto('http://localhost:3000');
  7   |     await page.waitForLoadState('networkidle');
  8   |     await page.waitForTimeout(1000);
  9   |   });
  10  | 
  11  |   test('page loads with title and header', async ({ page }) => {
  12  |     await expect(page.locator('h1')).toContainText('AstroPlan');
  13  |     await expect(page.getByText('Milky Way Photography Planner')).toBeVisible();
  14  |   });
  15  | 
  16  |   test('calendar grid renders 35 day cells', async ({ page }) => {
  17  |     const cells = page.locator('button[aria-label^="Day"]');
  18  |     await expect(cells).toHaveCount(35);
  19  |   });
  20  | 
  21  |   test('month navigation works', async ({ page }) => {
  22  |     const monthText = page.locator('span.text-base.font-semibold.text-white').first();
  23  |     const initial = await monthText.textContent();
  24  | 
  25  |     await page.getByText('›').click();
  26  |     await page.waitForTimeout(1500);
  27  | 
  28  |     const updated = await monthText.textContent();
  29  |     expect(updated).not.toBe(initial);
  30  |   });
  31  | 
  32  |   test('location search shows error for empty query', async ({ page }) => {
  33  |     await page.getByText('🔍').click();
  34  |     await page.waitForTimeout(500);
  35  |     await expect(page.locator('p.text-sm.text-red-400')).toBeVisible();
  36  |   });
  37  | 
  38  |   test('day cell click opens modal', async ({ page }) => {
  39  |     const cells = page.locator('button[aria-label^="Day"]');
  40  |     await cells.nth(10).click();
  41  |     await page.waitForTimeout(1000);
  42  |     // Modal shows date heading (h2 with date format)
  43  |     await expect(page.locator('h2.text-xl')).toBeVisible();
  44  |   });
  45  | 
  46  |   test('modal closes on X button', async ({ page }) => {
  47  |     const cells = page.locator('button[aria-label^="Day"]');
  48  |     await cells.nth(10).click();
  49  |     await page.waitForTimeout(1000);
  50  | 
  51  |     // Close button in modal header
  52  |     await page.locator('h2.text-xl button, div button').filter({ hasText: /×|x/ }).first().click();
  53  |     await page.waitForTimeout(500);
  54  |     await expect(page.locator('h2.text-xl')).not.toBeVisible();
  55  |   });
  56  | 
  57  |   test('settings panel opens and closes', async ({ page }) => {
  58  |     await page.locator('button[title="Settings"]').click();
  59  |     await page.waitForTimeout(1000);
  60  |     await expect(page.getByText('Settings').first()).toBeVisible();
  61  | 
  62  |     // Close button
  63  |     await page.locator('button').filter({ hasText: /×|x/ }).last().click();
  64  |     await page.waitForTimeout(500);
  65  |   });
  66  | 
  67  |   test('settings persist in localStorage', async ({ page }) => {
  68  |     await page.locator('button[title="Settings"]').click();
  69  |     await page.waitForTimeout(1000);
  70  | 
  71  |     const apiKeyInput = page.locator('input[type="password"]');
> 72  |     await apiKeyInput.fill('test-api-key-123');
      |                       ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  73  |     await page.getByText('Save Settings').click();
  74  |     await page.waitForTimeout(1000);
  75  | 
  76  |     // Reload
  77  |     await page.reload();
  78  |     await page.waitForLoadState('networkidle');
  79  |     await page.waitForTimeout(1000);
  80  | 
  81  |     await page.locator('button[title="Settings"]').click();
  82  |     await page.waitForTimeout(1000);
  83  | 
  84  |     const savedKey = await page.locator('input[type="password"]').inputValue();
  85  |     expect(savedKey).toBe('test-api-key-123');
  86  |   });
  87  | 
  88  |   test('best days summary shows ranked list', async ({ page }) => {
  89  |     await expect(page.getByText('Best Shooting Days')).toBeVisible();
  90  |     await expect(page.getByText(/🥇|🥈|🥉/).first()).toBeVisible();
  91  |   });
  92  | 
  93  |   test('notification banner is visible', async ({ page }) => {
  94  |     await expect(page.getByText('Shooting Alerts')).toBeVisible();
  95  |   });
  96  | 
  97  |   test('legend is displayed', async ({ page }) => {
  98  |     await expect(page.getByText('GC Rise')).toBeVisible();
  99  |     await expect(page.getByText('GC Set')).toBeVisible();
  100 |     await expect(page.getByText('Moon Bright')).toBeVisible();
  101 |     await expect(page.getByText('Dark Sky')).toBeVisible();
  102 |   });
  103 | 
  104 |   test('mock cloud data is non-zero (bug fix verification)', async ({ page }) => {
  105 |     const cloudTexts = page.locator('text=/☁ \\d+%/');
  106 |     const count = await cloudTexts.count();
  107 |     expect(count).toBeGreaterThan(0);
  108 | 
  109 |     let nonZeroFound = false;
  110 |     for (let i = 0; i < Math.min(count, 10); i++) {
  111 |       const text = await cloudTexts.nth(i).textContent();
  112 |       const match = text?.match(/☁ (\d+)%/);
  113 |       if (match && parseInt(match[1]) > 0) {
  114 |         nonZeroFound = true;
  115 |         break;
  116 |       }
  117 |     }
  118 |     expect(nonZeroFound).toBe(true);
  119 |   });
  120 | 
  121 |   test('day modal shows sun & moon times', async ({ page }) => {
  122 |     const cells = page.locator('button[aria-label^="Day"]');
  123 |     for (let i = 7; i < 20; i++) {
  124 |       await cells.nth(i).click();
  125 |       await page.waitForTimeout(1000);
  126 |       if (await page.getByText('Sun & Moon Times').isVisible({ timeout: 3000 })) {
  127 |         await expect(page.getByText('Sunrise')).toBeVisible();
  128 |         await expect(page.getByText('Sunset')).toBeVisible();
  129 |         break;
  130 |       }
  131 |       // Close and try next
  132 |       const closeBtn = page.locator('button').filter({ hasText: /×/ }).last();
  133 |       if (await closeBtn.isVisible({ timeout: 2000 })) await closeBtn.click();
  134 |       await page.waitForTimeout(500);
  135 |     }
  136 |   });
  137 | 
  138 |   test('checklist panel works in modal', async ({ page }) => {
  139 |     const cells = page.locator('button[aria-label^="Day"]');
  140 |     await cells.nth(10).click();
  141 |     await page.waitForTimeout(1000);
  142 | 
  143 |     if (await page.getByText('Shooting Checklist').isVisible({ timeout: 5000 })) {
  144 |       await expect(page.getByText('Camera + lens')).toBeVisible();
  145 |       await expect(page.getByText('Tripod')).toBeVisible();
  146 |     }
  147 |   });
  148 | });
  149 | 
```