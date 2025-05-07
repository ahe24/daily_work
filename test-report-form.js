const puppeteer = require('puppeteer');

async function testReportForm() {
  console.log('Starting Report Form test...');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000/reports/new');
    console.log('Navigated to Report Form page');
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 5000 });
    
    // Test form validation
    console.log('Testing form validation...');
    const submitButton = await page.$('button[type="submit"]');
    await submitButton.click();
    
    // Check if error messages appear
    const hasErrors = await page.evaluate(() => {
      return document.querySelectorAll('.MuiFormHelperText-root').length > 0;
    });
    
    console.log(`Form validation ${hasErrors ? 'works correctly' : 'failed'}`);
    
    // Fill in the form
    console.log('Filling in form fields...');
    
    // Title
    await page.type('input[name="title"]', 'Test Report');
    
    // Select user
    await page.click('#user-label');
    await page.waitForSelector('li[data-value="1"]');
    await page.click('li[data-value="1"]');
    
    // Fill in report content
    await page.type('textarea[name="weeklyPlan"]', 'Test weekly plan');
    await page.type('textarea[name="weeklyDo"]', 'Test weekly do');
    await page.type('textarea[name="weeklyCheck"]', 'Test weekly check');
    await page.type('textarea[name="nextWeekPlan"]', 'Test next week plan');
    
    // Submit the form
    console.log('Submitting form...');
    await submitButton.click();
    
    // Check for success message
    await page.waitForSelector('.MuiAlert-standardSuccess', { timeout: 5000 });
    console.log('Form submitted successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testReportForm();
