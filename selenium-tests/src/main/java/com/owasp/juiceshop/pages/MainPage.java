package com.owasp.juiceshop.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;

public class MainPage extends BasePage {
    
    @FindBy(css = "app-navbar")
    private WebElement navbar;
    
    @FindBy(css = "app-welcome")
    private WebElement welcomeSection;
    
    @FindBy(css = "app-welcome-banner")
    private WebElement welcomeBanner;
    
    @FindBy(css = "app-welcome-banner h1")
    private WebElement welcomeTitle;
    
    @FindBy(css = "app-welcome-banner div.text-justify")
    private WebElement welcomeMessage;
    
    @FindBy(css = "app-welcome-banner button.mat-raised-button")
    private List<WebElement> welcomeButtons;
    
    public MainPage(WebDriver driver) {
        super(driver);
    }
    
    public void open() {
        driver.get(baseUrl);
    }
    
    @Override
    public boolean isPageLoaded() {
        try {
            waitForElementVisible(navbar);
            waitForElementVisible(welcomeSection);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isWelcomeBannerDisplayed() {
        try {
            waitForElementVisible(welcomeBanner);
            return welcomeBanner.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    public String getWelcomeTitle() {
        waitForElementVisible(welcomeTitle);
        return welcomeTitle.getText();
    }
    
    public String getWelcomeMessage() {
        waitForElementVisible(welcomeMessage);
        return welcomeMessage.getAttribute("innerHTML");
    }
    
    public List<WebElement> getWelcomeButtons() {
        return welcomeButtons;
    }
    
    public List<WebElement> getAllLinks() {
        return findAllLinks();
    }
}
