package com.owasp.juiceshop.tests;

import com.owasp.juiceshop.framework.DriverManager;
import com.owasp.juiceshop.utils.ScreenshotUtils;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInfo;
import org.openqa.selenium.WebDriver;

public class BaseTest {
    protected static WebDriver driver;
    
    @BeforeAll
    public static void setUp() {
        driver = DriverManager.getDriver();
    }
    
    @AfterEach
    public void tearDown(TestInfo testInfo) {
        ScreenshotUtils.takeScreenshot(driver, testInfo.getDisplayName());
    }
    
    @AfterAll
    public static void cleanUp() {
        DriverManager.quitDriver();
    }
}
