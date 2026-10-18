// ==============================================================
// 1. ตั้งค่า DISCORD WEBHOOK URL
// ==============================================================
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1561355063241474069/4eaapW0aFhv_BN46XodHbLNdEdsOcxVG_lfmDnqbMgsfQdt49ezpiocJFty_g1AwoQcW";


// ==============================================================
// 2. ระบบนาฬิกา Real-time
// ==============================================================
function updateClock() {
  const now = new Date();
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  };
  const clockEl = document.getElementById('liveClock');
  if (clockEl) {
    clockEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${now.toLocaleDateString('th-TH', options)} น.`;
  }
}
setInterval(updateClock, 1000);
updateClock();


// ==============================================================
// 3. ระบบเพิ่ม / ลบ จุดส่งปลายทาง
// ==============================================================
let destCount = 1;

function addDestinationField() {
  destCount++;
  const container = document.getElementById('destinationList');
  const div = document.createElement('div');
  div.className = 'dest-row';
  div.id = 'destRow_' + destCount;
  div.innerHTML = `
    <span class="dest-badge">${destCount}</span>
    <input type="text" class="dest-input" placeholder="จุดส่งที่ ${destCount}" required>
    <button type="button" class="btn-remove" onclick="removeDestinationField(${destCount})">
      <i class="fa-solid fa-trash-can"></i>
    </button>
  `;
  container.appendChild(div);
}

function removeDestinationField(id) {
  const row = document.getElementById('destRow_' + id);
  if (row) {
    row.remove();
    updateBadges();
  }
}

function updateBadges() {
  const badges = document.querySelectorAll('.dest-badge');
  badges.forEach((badge, index) => {
    badge.textContent = index + 1;
  });
  destCount = badges.length;
}


// ==============================================================
// 4. ส่งข้อมูลเข้า Discord Webhook (เว้นวรรคช่องไฟโปร่งตา 100%)
// ==============================================================
async function handleFormSubmit(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  if (DISCORD_WEBHOOK_URL.includes("วาง_WEBHOOK_URL_ตรงนี้")) {
    alert("⚠️ กรุณานำลิงก์ Discord Webhook URL มาใส่ในไฟล์ script.js บรรทัดที่ 4 ก่อนครับ!");
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const destInputs = document.querySelectorAll('.dest-input');
  const destinations = [];
  
  destInputs.forEach((input, index) => {
    if (input.value.trim() !== '') {
      destinations.push(`${index + 1}. ${input.value.trim()}`);
    }
  });

  const senderName = document.getElementById('senderName').value.trim();
  const origin = document.getElementById('origin').value;
  const destinationText = destinations.length > 0 ? destinations.join('\n') : '-';

  const now = new Date();
  const timeStr = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // ใช้ Invisible Character คั่นบรรทัด บังคับให้ Discord ดันระยะห่างอย่างแน่นอน
  const payload = {
    username: "N Health IV Dispatcher",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
    embeds: [
      {
        description: `### 🏥 ใบแจ้งงานจัดส่งน้ำเกลือ (รพ.ราชวิถี)\n` +
                     `‎\n` +
                     `👤 **ผู้เดินงาน :** **${senderName || "-"}**\n` +
                     `‎\n` +
                     `🕒 **เวลาบันทึก :** **${timeStr} น.**\n` +
                     `‎\n` +
                     `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
        color: 0x0EA5E9,
        fields: [
          {
            name: "📍 จุดรับต้นทาง (กด Copy ได้)",
            value: "```fix\n" + (origin || "-") + "\n```",
            inline: false
          },
          {
            name: "🎯 ลำดับปลายทางจัดส่ง (กด Copy ได้)",
            value: "```yaml\n" + destinationText + "\n```",
            inline: false
          }
        ],
        footer: {
          text: "N Health IV Logistics • โรงพยาบาลราชวิถี"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังส่งข้อมูล...';

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> ยืนยันการส่งข้อมูล';

    if (response.ok || response.status === 204) {
      document.getElementById('successModal').classList.add('active');
      document.getElementById('deliveryForm').reset();
      
      document.getElementById('destinationList').innerHTML = `
        <div class="dest-row">
          <span class="dest-badge">1</span>
          <input type="text" class="dest-input" placeholder="จุดส่งที่ 1 (เช่น ตึกเฉลิมพระเกียรติ หอผู้ป่วย 8B)" required>
        </div>
      `;
      destCount = 1;
    } else {
      const errDetail = await response.text();
      alert(`ส่งข้อมูลเข้า Discord ไม่สำเร็จ (รหัส ${response.status}):\n${errDetail}`);
    }
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> ยืนยันการส่งข้อมูล';
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message);
  }
}


// ==============================================================
// 5. ควบคุม Modal Pop-up
// ==============================================================
function closeModal() {
  document.getElementById('successModal').classList.remove('active');
}
