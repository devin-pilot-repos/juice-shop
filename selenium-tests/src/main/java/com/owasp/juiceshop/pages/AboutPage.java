package com.owasp.juiceshop.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;

public class AboutPage extends BasePage {
    
    @FindBy(css = "mat-card section.about-us")
    private WebElement aboutSection;
    
    @FindBy(css = "mat-card section.about-us h1")
    private WebElement aboutTitle;
    
    @FindBy(css = "section.about-us h3")
    private List<WebElement> sectionHeaders;
    
    @FindBy(css = "section.about-us p.text-justify a")
    private WebElement termsOfUseLink;
    
    @FindBy(css = "div.social a")
    private List<WebElement> socialMediaLinks;
    
    @FindBy(css = "div.social h3")
    private WebElement socialMediaHeader;
    
    public AboutPage(WebDriver driver) {
        super(driver);
    }
    
    public void open() {
        driver.get(baseUrl + "/#/about");
    }
    
    @Override
    public boolean isPageLoaded() {
        try {
            waitForElementVisible(aboutSection);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public String getAboutTitle() {
        waitForElementVisible(aboutTitle);
        return aboutTitle.getText();
    }
    
    public List<WebElement> getSectionHeaders() {
        return sectionHeaders;
    }
    
    public WebElement getTermsOfUseLink() {
        waitForElementVisible(termsOfUseLink);
        return termsOfUseLink;
    }
    
    public boolean isSocialMediaSectionDisplayed() {
        try {
            waitForElementVisible(socialMediaHeader);
            return socialMediaHeader.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    public List<WebElement> getSocialMediaLinks() {
        return socialMediaLinks;
    }
    
    public List<WebElement> getAllLinks() {
        return findAllLinks();
    }
}
