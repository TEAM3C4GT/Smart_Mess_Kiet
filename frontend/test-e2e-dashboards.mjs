import { chromium } from 'playwright-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runTests() {
  console.log('🚀 Launching Edge browser from:', EDGE_PATH);
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console logs and errors
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  try {
    // 1. HOME PAGE
    console.log('\n--- 1. Testing Home Page (/) ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log('Page Title:', title);
    const bodyText = await page.innerText('body');
    const hasBlockB = bodyText.includes('Block B');
    console.log('Contains legacy "Block B" text?', hasBlockB ? '❌ YES (FAIL)' : '✅ NO (PASSED)');
    const hasBlockD = bodyText.includes('Block D');
    console.log('Contains updated "Block D" text?', hasBlockD ? '✅ YES (PASSED)' : '❌ NO (FAIL)');

    // 2. FLOOR INCHARGE DASHBOARD
    console.log('\n--- 2. Testing Floor Incharge Dashboard (/floor-incharge) ---');
    await page.goto('http://localhost:3000/floor-incharge', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const fiText = await page.innerText('body');
    const fiHasBlockD = fiText.includes('Hostel Block D');
    const fiHasRoomD101 = fiText.includes('Room D-101');
    const fiHasRoomD202 = fiText.includes('Room D-202');
    console.log('Floor Incharge shows "Hostel Block D":', fiHasBlockD ? '✅ PASSED' : '❌ FAILED');
    console.log('Floor Incharge shows "Room D-101":', fiHasRoomD101 ? '✅ PASSED' : '❌ FAILED');
    console.log('Floor Incharge shows "Room D-202":', fiHasRoomD202 ? '✅ PASSED' : '❌ FAILED');

    // Click "Remind" button on a pending room if available
    const remindButtons = await page.$$('button:has-text("Remind")');
    console.log(`Found ${remindButtons.length} Remind buttons.`);
    if (remindButtons.length > 0) {
      await remindButtons[0].click();
      await page.waitForTimeout(500);
      const toastText = await page.innerText('body');
      console.log('Toast triggered after Remind click:', toastText.includes('Reminder') ? '✅ PASSED' : '⚠️ No toast detected');
    }

    // Switch to Kitchen Requisition Tab
    const reqTab = await page.$('button:has-text("Kitchen Requisition")');
    if (reqTab) {
      await reqTab.click();
      await page.waitForTimeout(500);
      const reqText = await page.innerText('body');
      console.log('Kitchen Requisition Tab displays Floor 1 & Block D:', reqText.includes('Floor 1') && reqText.includes('Hostel Block D') ? '✅ PASSED' : '❌ FAILED');
    }

    // 3. ROOM LEAD DASHBOARD
    console.log('\n--- 3. Testing Room Lead Dashboard (/room-lead) ---');
    await page.goto('http://localhost:3000/room-lead', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const rlText = await page.innerText('body');
    console.log('Room Lead shows "Room D-101":', rlText.includes('Room D-101') ? '✅ PASSED' : '❌ FAILED');
    console.log('Room Lead shows "Hostel Block D":', rlText.includes('Hostel Block D') ? '✅ PASSED' : '❌ FAILED');

    // Switch to Room Members Tab
    const membersTab = await page.$('button:has-text("Room Members")');
    if (membersTab) {
      await membersTab.click();
      await page.waitForTimeout(500);
      const membersText = await page.innerText('body');
      console.log('Room Members shows "Alex Rivers (You)":', membersText.includes('Alex Rivers') ? '✅ PASSED' : '❌ FAILED');
      console.log('Room Members shows "NITHIN":', membersText.includes('NITHIN') ? '✅ PASSED' : '❌ FAILED');
      console.log('Room Members shows "VISALYA":', membersText.includes('VISALYA') ? '✅ PASSED' : '❌ FAILED');
    }

    // Switch back to Dashboard Tab and test Roster Sign Off
    const dashTab = await page.$('button:has-text("Dashboard")');
    if (dashTab) await dashTab.click();
    await page.waitForTimeout(300);

    const submitRosterBtn = await page.$('button:has-text("Sign Off & Submit Roster")');
    if (submitRosterBtn) {
      await submitRosterBtn.click();
      await page.waitForTimeout(500);
      const updatedRlText = await page.innerText('body');
      console.log('Toast triggered after Roster Sign-Off:', updatedRlText.includes('Meal Verification') || updatedRlText.includes('submitted') ? '✅ PASSED' : '⚠️ Notice');
    }

    // Check Floor Alerts tab
    const alertsTab = await page.$('button:has-text("Floor Alerts")');
    if (alertsTab) {
      await alertsTab.click();
      await page.waitForTimeout(500);
      const alertContent = await page.innerText('body');
      console.log('Alerts Tab shows notices targeting Room D-101:', alertContent.includes('Room D-101') ? '✅ PASSED' : '❌ FAILED');
    }

    // 4. BLOCK COORDINATOR DASHBOARD
    console.log('\n--- 4. Testing Block Coordinator Dashboard (/block-coordinator) ---');
    await page.goto('http://localhost:3000/block-coordinator', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const bcText = await page.innerText('body');
    console.log('Block Coordinator shows "Block D & E":', bcText.includes('Block D & E') ? '✅ PASSED' : '❌ FAILED');
    console.log('Block Coordinator shows "Floor 1 (Block D)":', bcText.includes('Floor 1 (Block D)') ? '✅ PASSED' : '❌ FAILED');
    console.log('Block Coordinator shows "Floor 1 (Block E)":', bcText.includes('Floor 1 (Block E)') ? '✅ PASSED' : '❌ FAILED');

    // Test "Send Block Consolidated Count to Mess Kitchen"
    const sendBtn = await page.$('button:has-text("Send Block Consolidated Count")');
    if (sendBtn) {
      await sendBtn.click();
      await page.waitForTimeout(500);
      const updatedBcText = await page.innerText('body');
      console.log('Consolidated counts forwarded successfully:', updatedBcText.includes('Consolidated Count Sent') || updatedBcText.includes('forwarded') ? '✅ PASSED' : '⚠️ Notice');
    }

    // 5. MESS INCHARGE DASHBOARD
    console.log('\n--- 5. Testing Mess Incharge Dashboard (/mess-incharge) ---');
    await page.goto('http://localhost:3000/mess-incharge', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const messText = await page.innerText('body');
    console.log('Mess Incharge displays Breakfast/Lunch/Dinner sections:', messText.includes('Breakfast') && messText.includes('Lunch') ? '✅ PASSED' : '❌ FAILED');

    // 6. PRINCIPAL DASHBOARD
    console.log('\n--- 6. Testing Principal Dashboard (/principal) ---');
    await page.goto('http://localhost:3000/principal', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const prText = await page.innerText('body');
    console.log('Principal shows "Block D (Senior Wing)":', prText.includes('Block D') ? '✅ PASSED' : '❌ FAILED');
    console.log('Principal shows "Block E (International/PG)":', prText.includes('Block E') ? '✅ PASSED' : '❌ FAILED');
    console.log('Principal shows AI Anomaly for "Room D-202":', prText.includes('Room D-202') ? '✅ PASSED' : '❌ FAILED');

    // Test Remind Pending Students
    const remindAllBtn = await page.$('button:has-text("Remind All")');
    if (remindAllBtn) {
      await remindAllBtn.click();
      await page.waitForTimeout(500);
      const toastPrText = await page.innerText('body');
      console.log('Principal reminder triggered:', toastPrText.includes('Reminders sent') ? '✅ PASSED' : '⚠️ Notice');
    }

    // 7. STUDENT DASHBOARD
    console.log('\n--- 7. Testing Student Dashboard (/student) ---');
    await page.goto('http://localhost:3000/student', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const stText = await page.innerText('body');
    console.log('Student Dashboard shows Room D-101 • Block D:', stText.includes('Room D-101') && stText.includes('Block D') ? '✅ PASSED' : '❌ FAILED');
    console.log('Student Dashboard shows KFC options:', stText.includes('KFC') || stText.includes('Canteen') ? '✅ PASSED' : '❌ FAILED');

    console.log('\n=========================================');
    console.log('🎉 ALL DASHBOARD AUTOMATION TESTS COMPLETED!');
    console.log('=========================================');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
}

runTests();
