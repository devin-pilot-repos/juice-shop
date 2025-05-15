package com.owasp.juiceshop.tests;

import com.owasp.juiceshop.pages.MainPage;
import com.owasp.juiceshop.utils.LinkValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class MainPageTest extends BaseTest {
    
    private MainPage mainPage;
    
    @BeforeEach
    public void setupTest() {
        mainPage = new MainPage(driver);
        mainPage.open();
        assertTrue(mainPage.isPageLoaded(), "Main page failed to load");
    }
    
    @Test
    @DisplayName("Main Page - Welcome Banner is displayed")
    public void testWelcomeBannerIsDisplayed() {
        assertTrue(mainPage.isWelcomeBannerDisplayed(), "Welcome banner should be displayed");
        assertFalse(mainPage.getWelcomeTitle().isEmpty(), "Welcome title should not be empty");
    }
    
    @Test
    @DisplayName("Main Page - Welcome message contains text")
    public void testWelcomeMessageHasContent() {
        String welcomeMessage = mainPage.getWelcomeMessage();
        assertNotNull(welcomeMessage, "Welcome message should not be null");
        assertFalse(welcomeMessage.isEmpty(), "Welcome message should not be empty");
    }
    
    @Test
    @DisplayName("Main Page - Welcome buttons are clickable")
    public void testWelcomeButtonsAreClickable() {
        List<WebElement> buttons = mainPage.getWelcomeButtons();
        assertFalse(buttons.isEmpty(), "At least one welcome button should be present");
        
        for (WebElement button : buttons) {
            assertTrue(button.isDisplayed(), "Button should be displayed");
            assertTrue(button.isEnabled(), "Button should be enabled");
        }
    }
    
    @Test
    @DisplayName("Main Page - All hyperlinks are valid")
    public void testAllLinksAreValid() {
        List<WebElement> links = mainPage.getAllLinks();
        assertFalse(links.isEmpty(), "Page should contain links");
        
        for (WebElement link : links) {
            if (!link.isDisplayed()) continue;
            
            String linkText = LinkValidator.getLinkText(link);
            System.out.println("Checking link: " + linkText);
            
            assertTrue(LinkValidator.isLinkValid(link), 
                    "Link should be valid: " + linkText);
        }
    }
}
