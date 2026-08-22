'use client';

import GuideSection from '@/components/planning/GuideSection';

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 mr-3">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

export default function GuideContent() {
  return (
    <div className="space-y-3">
      {/* ── Group A: ใช้แอปนี้ยังไง ── */}
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">📖 Using This App</h2>

      <GuideSection icon="🌙" title="Moon Level & Calendar Colors" subtitle="พื้นหลังวันในปฏิทินบอกอะไร">
        <p className="mb-2">
          แต่ละวันมี Moon Level 1–10 (ความสว่างดวงจันทร์ %) — ยิ่งน้อยยิ่งดีสำหรับถ่ายท้องฟ้า:
        </p>
        <div className="mb-2">
          <Legend color="bg-slate-700" label="1–3 Dark (best)" />
          <Legend color="bg-purple-500" label="4–7 Moderate" />
          <Legend color="bg-yellow-400" label="8–10 Bright (worst)" />
        </div>
        <p>
          พื้นหลังเข้ม = เดือนมืด เหมาะถ่าย Milky Way / พื้นหลังเหลือง-ทอง = จันทร์เต็มดวง
          แสงจันทร์จะกลืนทางช้างเผือก
        </p>
      </GuideSection>

      <GuideSection icon="🌌" title="GC Rise / Set Points" subtitle="จุดเขียว-แดงในช่องวัน">
        <p className="mb-2">
          GC = Galactic Center (ใจกลางทางช้างเผือก — ส่วนที่สว่างและพิเศษที่สุดสำหรับการถ่ายภาพ)
        </p>
        <p className="mb-2">
          <span className="text-emerald-400 font-medium">● เขียว</span> = GC เริ่มมองเห็นช่วงความมืด ·{' '}
          <span className="text-rose-400 font-medium">● แดง</span> = ช่วงจบ (ความมืดหมดหรือ GC ตก)
        </p>
        <p>เวลาที่แสดงถูก clamp กับ Astronomical Night แล้ว = ช่วงที่ถ่ายจริงได้เลย ไม่ใช่ rise/set ดิบ</p>
      </GuideSection>

      <GuideSection icon="🌠" title="Milky Way Season Banner" subtitle="Peak / Shoulder / Off อ่านยังไง">
        <p className="mb-2">
          Banner บนหน้าปฏิทินสรุปว่า &ldquo;เดือนนี้&rdquo; ที่ตำแหน่งที่คุณเลือก เห็น core กลางคืนกี่คืน:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><span className="text-indigo-300 font-medium">Peak</span> — มีหลายคืนที่มืดพร้อม GC (เดือนทอง วางแผนทริปได้เลย)</li>
          <li><span className="text-yellow-300 font-medium">Shoulder</span> — core ขึ้นกลางคืนได้ แต่จันทร์สว่าง/หน้าต่างสั้น</li>
          <li><span className="text-slate-400 font-medium">Off</span> — core ขึ้นเฉพาะกลางวัน/หัวค่ำ ไม่คุ้มออกไปถ่าย</li>
        </ul>
      </GuideSection>

      <GuideSection icon="⚖️" title="Shooting Score & Filter" subtitle="คะแนน 0–100 กับ 4 โหมด">
        <p className="mb-2">
          ทุกวันมีคะแนนรวม (moon + cloud + Bortle + GC) — ≥ 60 นับเป็น &ldquo;good shooting day&rdquo;
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><span className="font-medium">⚖️ Balanced</span> — ถ่วงน้ำหนักทุกอย่างเท่ากัน (ค่าเริ่มต้น)</li>
          <li><span className="font-medium">🌙 Moon</span> — เน้นคืนมืดสุด</li>
          <li><span className="font-medium">☁️ Cloud</span> — เน้นท้องฟ้าโปร่ง</li>
          <li><span className="font-medium">🌌 GC</span> — เน้นเฉพาะคืนที่ GC มองเห็น</li>
        </ul>
      </GuideSection>

      <GuideSection icon="🌃" title="Bortle Scale (Light Pollution)" subtitle="ตัวเลข 1–9 ที่อยู่ข้างชื่อสถานที่">
        <p className="mb-2">ค่า Bortle วัดมลพิษแสงของพื้นที่ (คำนวณจากความสว่างท้องฟ้าจริง):</p>
        <ul className="list-disc list-inside space-y-1">
          <li><span className="font-medium">1–2</span> — ท้องฟ้ามืดสนิท เห็น MW ด้วยตาเปล่า (เช่น มอหินขาว B2)</li>
          <li><span className="font-medium">3–4</span> — ค่อนข้างมืด ถ่าย MW ได้สบาย</li>
          <li><span className="font-medium">5–6</span> — ชานเมือง ต้องเลนส์ให้แสง + ประมวลผล</li>
          <li><span className="font-medium">7–9</span> — ในเมือง แทบไม่เห็น MW ด้วยตาเปล่า</li>
        </ul>
        <p className="mt-2">แถบสีบนชื่อสถานที่ = สีตามระดับ Bortle ของจุดนั้น</p>
      </GuideSection>

      {/* ── Group B: พื้นฐานถ่าย Milky Way ── */}
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-2">🔭 Milky Way Basics</h2>

      <GuideSection icon="📅" title="MW Season" subtitle="ถ่ายทางช้างเผือกช่วงไหนดี">
        <p className="mb-2">
          ซีกเหนือของโลก core ของ MW อยู่ในท้องฟ้ากลางคืนราว <span className="font-medium">ก.พ.–ต.ค.</span> —
          จุดหวานคือ ~พ.ค.–ส.ค. ที่ core ขึ้นช่วงหัวค่ำถึงเที่ยงคืน
        </p>
        <p>
          หน้าฝนต้องเล็งช่วงมืดหมู่/คืนโปร่ง ส่วนหน้าหนาวฟ้าโปร่งแต่ core ขึ้นดึกและหน้าต่างสั้นลง —
          เช็ก Season Banner ก่อนวางแผนทริป
        </p>
      </GuideSection>

      <GuideSection icon="📍" title="เลือกสถานที่" subtitle="ไกลแสงเมืองแค่ไหนพอ">
        <p>
          เลือกจุดที่ Bortle ≤ 4 (ดูค่าที่แถบสีข้างชื่อสถานที่) และห่างเมือง/เมืองใหญ่อย่างน้อย
          50–100 กม. ทิศทางที่มองเห็น horizon ใต้ (GC อยู่ทางทิศใต้) จะได้มุม core สวยๆ
        </p>
      </GuideSection>

      <GuideSection icon="🎒" title="อุปกรณ์ขั้นต่ำ" subtitle="ของที่ควรมีติดกระเป๋า">
        <ul className="list-disc list-inside space-y-1">
          <li>กล้องที่ตั้ง exposure/ISO/manual focus ได้ (MLC หรือ DSLR)</li>
          <li>เลนส์ wide ให้แสง (14–24mm, f/2.8 หรือต่ำกว่า)</li>
          <li>ขาตั้งถ่าย — สำคัญที่สุด ห้ามลืม</li>
          <li>ถ่านสำรอง (กล้องช่วงหนาว/ค้างคืนกินแบตมาก) + การ์ดหน่วยความจำ</li>
          <li>ไฟฉายแสงแดง (อย่าใช้ไฟขาว — ทำลายการปรับตาของตา 20–30 นาที)</li>
        </ul>
        <p className="mt-2">เช็กลิสต์ประจำวันมีให้กดในหน้าต่างรายละเอียดของแต่ละวัน</p>
      </GuideSection>

      <GuideSection icon="📷" title="ตั้งค่ากล้องเริ่มต้น" subtitle="จุดตั้งต้นที่ลองได้เลย">
        <ul className="list-disc list-inside space-y-1">
          <li>โหมด M · เลนส์เปิดหน้ากว้างสุด (f/ต่ำสุด)</li>
          <li>ISO 1600–6400 (ขึ้นกับกล้อง/ท้องฟ้า)</li>
          <li>Shutter 10–25 วินาที — ใช้ Rule of 500: 500 ÷ (focal length × crop) ≈ วินาทีสูงสุดก่อนดาวเป็นเส้น</li>
          <li>Manual focus ที่ดาวสว่างดวงหนึ่ง (ซูม live view จนดาวเล็กสุด) แล้วล็อกโฟกัส</li>
          <li>ถ่าย RAW + ตั้ง white balance ท้องฟ้าค้างคาว ~3800–4200K</li>
        </ul>
      </GuideSection>

      <GuideSection icon="✅" title="เช็กลิสต์ก่อนออกเดินทาง" subtitle="อย่างน้อย 3 อย่างนี้">
        <ul className="list-disc list-inside space-y-1">
          <li>Moon level ≤ 3 (คืนมืด)</li>
          <li>Cloud cover &lt; 30%</li>
          <li>GC window ของคืนนั้นมีเวลาพอ (ดูจุดเขียว-แดง)</li>
        </ul>
        <p className="mt-2">ทั้งหมดนี้ดูได้ในปฏิทิน/หน้าต่างรายละเอียดของวัน</p>
      </GuideSection>
    </div>
  );
}
