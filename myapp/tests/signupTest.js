//inspired by https://reflect.run/articles/writing-end-to-end-tests-in-nodejs-using-selenium/

require("chromedriver");
const { Builder, By, Key, until } = require("selenium-webdriver");
var assert = require("assert");

(async function signupTest() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
      // navigate to signup
      await driver.get("http://localhost:3000/auth/signup");

      // type 'redstar123' in the username input field
      await driver.findElement(By.name("username")).sendKeys("newsignup456");

      // type 'redstar123' in the username input field
      await driver.findElement(By.name("password")).sendKeys("newsignup456");

      //click on the submit button
      await driver.findElement(By.css('button[type="submit"]')).click();

      /* wait for the page to load 
        title is equal to `Home Page */
      await driver.wait(until.titleIs("Home Page"), 1000);

      // Get the pagetitle of the current Page
      let pageTitle = await driver.getTitle();

      // assert that the current pageTitle is equal to 'Home Page'
      assert.strictEqual(pageTitle, "Home Page");
      if (pageTitle) {
        console.log("Page Title:", pageTitle);
      }
    } catch (error) {
        console.error('Assertion failed:', error);
    } finally {
      // close the browser
      await driver.quit();
    }
})();