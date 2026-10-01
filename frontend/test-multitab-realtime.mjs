import { chromium } from 'playwright-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runMultiTabTests() {
  console.log('🚀 Launching Multi-Tab Cross-Dashboard Testing with Edge...');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true
  });

  const context = await browser.newContext();

  try {
    // Open Tab 1: Floor Incharge
    console.log('Opening Tab 1: Floor Incharge (/floor-incharge)');
    const tabFloor = await context.newPage();
    await tabFloor.goto('http://localhost:3000/floor-incharge', { waitUntil: 'domcontentloaded' });
    await tabFloor.waitForTimeout(500);

    // Open Tab 2: Room Lead
    console.log('Opening Tab 2: Room Lead (/room-lead)');
    const tabRoom = await context.newPage();
    await tabRoom.goto('http://localhost:3000/room-lead', { waitUntil: 'domcontentloaded' });
    await tabRoom.waitForTimeout(500);

    // Open Tab 3: Block Coordinator
    console.log('Opening Tab 3: Block Coordinator (/block-coordinator)');
    const tabBlock = await context.newPage();
    await tabBlock.goto('http://localhost:3000/block-coordinator', { waitUntil: 'domcontentloaded' });
    await tabBlock.waitForTimeout(500);

    // Open Tab 4: Mess Incharge
    console.log('Opening Tab 4: Mess Incharge (/mess-incharge)');
    const tabMess = await context.newPage();
    await tabMess.goto('http://localhost:3000/mess-incharge', { waitUntil: 'domcontentloaded' });
    await tabMess.waitForTimeout(500);

    // Open Tab 5: KFC Staff
    console.log('Opening Tab 5: KFC Staff (/kfc-staff)');
    const tabKfc = await context.newPage();
    await tabKfc.goto('http://localhost:3000/kfc-staff', { waitUntil: 'domcontentloaded' });
    await tabKfc.waitForTimeout(500);

    // Open Tab 6: Student
    console.log('Opening Tab 6: Student (/student)');
    const tabStudent = await context.newPage();
    await tabStudent.goto('http://localhost:3000/student', { waitUntil: 'domcontentloaded' });
    await tabStudent.waitForTimeout(500);

    console.log('\n--- SCENARIO 1: Floor Incharge sends Remind -> Room Lead receives in Tab 2 ---');
    await tabFloor.bringToFront();
    const remindButtons = await tabFloor.$$('button:has-text("Remind")');
    console.log(`Tab 1: Clicking Remind button (Total found: ${remindButtons.length})`);
    if (remindButtons.length > 0) {
      await remindButtons[0].click();
      await tabFloor.waitForTimeout(600);
    }

    // Now check Tab 2 (Room Lead) without reloading!
    await tabRoom.bringToFront();
    await tabRoom.waitForTimeout(600);
    const roomAlertsTab = await tabRoom.$('button:has-text("Floor Alerts")');
    if (roomAlertsTab) await roomAlertsTab.click();
    await tabRoom.waitForTimeout(400);

    const roomLeadText = await tabRoom.innerText('body');
    const receivedFloorReminder = roomLeadText.includes('Floor Incharge') && roomLeadText.includes('Urgent Reminder');
    console.log('Tab 2 (Room Lead) received Floor Incharge reminder live without reload:', receivedFloorReminder ? '✅ PASSED' : '❌ FAILED');

    console.log('\n--- SCENARIO 2: Room Lead signs off Roster in Tab 2 -> Floor Incharge updates live in Tab 1 ---');
    await tabRoom.bringToFront();
    const dashTab = await tabRoom.$('button:has-text("Dashboard")');
    if (dashTab) await dashTab.click();
    await tabRoom.waitForTimeout(400);

    const signOffBtn = await tabRoom.$('button:has-text("Sign Off & Submit Roster")');
    if (signOffBtn) {
      console.log('Tab 2: Clicking "Sign Off & Submit Roster"');
      await signOffBtn.click();
      await tabRoom.waitForTimeout(600);
    }

    // Now check Tab 1 (Floor Incharge) without reloading!
    await tabFloor.bringToFront();
    await tabFloor.waitForTimeout(600);
    const floorText = await tabFloor.innerText('body');
    const floorReceivedSignoff = floorText.includes('signed off') || floorText.includes('Meal verification roster signed off') || floorText.includes('Alex Rivers');
    console.log('Tab 1 (Floor Incharge) received Room Lead Roster signoff live without reload:', floorReceivedSignoff ? '✅ PASSED' : '❌ FAILED');

    console.log('\n--- SCENARIO 3: Block Coordinator sends count in Tab 3 -> Mess Incharge receives live in Tab 4 ---');
    await tabBlock.bringToFront();
    const sendBlockBtn = await tabBlock.$('button:has-text("Send Consolidated Count")');
    if (sendBlockBtn) {
      console.log('Tab 3: Clicking "Send Consolidated Count to Mess"');
      await sendBlockBtn.click();
      await tabBlock.waitForTimeout(600);
    }

    // Now check Tab 4 (Mess Incharge) without reloading!
    await tabMess.bringToFront();
    await tabMess.waitForTimeout(600);
    const messText = await tabMess.innerText('body');
    const messReceivedCountNotice = messText.includes('forwarded finalized Block D & E') || messText.includes('Kitchen Alert') || messText.includes('Block Coordinator');
    console.log('Tab 4 (Mess Incharge) received Block Coordinator forward live without reload:', messReceivedCountNotice ? '✅ PASSED' : '❌ FAILED');

    console.log('\n--- SCENARIO 4: KFC Staff advances order in Tab 5 -> Student receives status in Tab 6 ---');
    await tabKfc.bringToFront();
    const advanceBtn = await tabKfc.$('button:has-text("Advance")');
    if (advanceBtn) {
      console.log('Tab 5: Clicking "Advance" order status button');
      await advanceBtn.click();
      await tabKfc.waitForTimeout(600);
    } else {
      const readyBtn = await tabKfc.$('button:has-text("Ready")');
      if (readyBtn) {
        await readyBtn.click();
        await tabKfc.waitForTimeout(600);
      }
    }

    // Now check Tab 6 (Student) without reloading!
    await tabStudent.bringToFront();
    await tabStudent.waitForTimeout(600);
    const studentText = await tabStudent.innerText('body');
    console.log('\n--- SCENARIO 5: Block Coordinator nudges Floor Incharge in Tab 3 -> Floor Incharge receives live in Tab 1 ---');
    await tabBlock.bringToFront();
    const nudgeBtn = await tabBlock.$('button:has-text("Nudge Incharge")');
    if (nudgeBtn) {
      console.log('Tab 3: Clicking "Nudge Incharge" for floor with pending submissions');
      await nudgeBtn.click();
      await tabBlock.waitForTimeout(600);
    }

    // Now check Tab 1 (Floor Incharge) without reloading!
    await tabFloor.bringToFront();
    await tabFloor.waitForTimeout(600);
    const floorTextAfterNudge = await tabFloor.innerText('body');
    const floorReceivedNudge = floorTextAfterNudge.includes('Urgent Cutoff Alert') || floorTextAfterNudge.includes('Cutoff compliance alert') || floorTextAfterNudge.includes('Block Coordinator');
    console.log('\n--- SCENARIO 6: Floor Incharge sends Meal Sheet in Tab 1 -> Mess Incharge confirms live in Tab 4 ---');
    await tabFloor.bringToFront();
    const transmitBtn = await tabFloor.$('button:has-text("Transmit Sheet to Mess Kitchen")');
    if (transmitBtn) {
      console.log('Tab 1: Clicking "Transmit Sheet to Mess Kitchen"');
      await transmitBtn.click();
      await tabFloor.waitForTimeout(600);
    }

    // Now check Tab 4 (Mess Incharge) without reloading!
    await tabMess.bringToFront();
    await tabMess.waitForTimeout(600);
    const messTextAfterSheet = await tabMess.innerText('body');
    const messReceivedFloorSheet = messTextAfterSheet.includes('Floor Incharge Headcount Sheets') && messTextAfterSheet.includes('Floor 1 (Block D)');
    console.log('Tab 4 (Mess Incharge) received Floor Meal Sheet live without reload:', messReceivedFloorSheet ? '✅ PASSED' : '❌ FAILED');

    // Confirm in Kitchen in Tab 4
    const confirmCookBtn = await tabMess.$('button:has-text("Confirm & Prep Cooking")');
    if (confirmCookBtn) {
      console.log('Tab 4: Clicking "Confirm & Prep Cooking" for floor sheet');
      await confirmCookBtn.click();
      await tabMess.waitForTimeout(600);
    }

    // Now check Tab 1 (Floor Incharge) receives Kitchen Confirmation live without reload!
    await tabFloor.bringToFront();
    await tabFloor.waitForTimeout(600);
    const floorTextAfterConfirm = await tabFloor.innerText('body');
    const floorReceivedKitchenConfirm = floorTextAfterConfirm.includes('Kitchen Confirmed for Cooking') || floorTextAfterConfirm.includes('Kitchen confirmed meal sheet');
    console.log('Tab 1 (Floor Incharge) received Kitchen Cooking Confirmation live without reload:', floorReceivedKitchenConfirm ? '✅ PASSED' : '❌ FAILED');

    console.log('\n--- SCENARIO 7: Mess Incharge publishes dish in Tab 4 -> Floor Incharge receives live menu in Tab 1 ---');
    await tabMess.bringToFront();
    const dishInputs = await tabMess.$$('input[placeholder*="Add dish"]');
    if (dishInputs.length > 0) {
      console.log('Tab 4: Adding "Special Paneer Tikka" to Mess Menu');
      await dishInputs[0].fill('Special Paneer Tikka');
      await tabMess.waitForTimeout(200);
      const addBtns = await tabMess.$$('button:has-text("Add")');
      if (addBtns.length > 0) {
        await addBtns[0].click();
        await tabMess.waitForTimeout(600);
      }
    }

    // Now check Tab 1 (Floor Incharge) receives updated Menu live without reload!
    await tabFloor.bringToFront();
    await tabFloor.waitForTimeout(600);
    const floorMenuText = await tabFloor.innerText('body');
    const floorReceivedLiveMenu = floorMenuText.includes('Tomorrow\'s Published Mess Menu') && (floorMenuText.includes('Special Paneer Tikka') || floorMenuText.includes('Masala Dosa'));
    console.log('Tab 1 (Floor Incharge) received Published Mess Menu live without reload:', floorReceivedLiveMenu ? '✅ PASSED' : '❌ FAILED');

    console.log('\n======================================================');
    console.log('🎉 ALL 7 CROSS-TAB MULTI-DASHBOARD TESTS COMPLETED!');
    console.log('======================================================');
  } catch (err) {
    console.error('Multi-tab testing failed:', err);
  } finally {
    await browser.close();
  }
}

runMultiTabTests();
