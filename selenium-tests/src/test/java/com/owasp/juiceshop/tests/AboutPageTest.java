package com.owasp.juiceshop.tests;

import com.owasp.juiceshop.pages.AboutPage;
import com.owasp.juiceshop.utils.LinkValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AboutPageTest extends BaseTest {
    
    private AboutPage aboutPage;
    
    @BeforeEach
    public void setupTest() {
        aboutPage = new AboutPage(driver);
        aboutPage.open();
        assertTrue(aboutPage.isPageLoaded(), "About page failed to load");
    }
    
    @Test
    @DisplayName("About Page - Title is correct")
    public void testPageTitleIsCorrect() {
        String title = aboutPage.getAboutTitle();
        assertNotNull(title, "About page title should not be null");
        assertFalse(title.isEmpty(), "About page title should not be empty");
    }
    
    @Test
    @DisplayName("About Page - Terms of Use link is valid")
    public void testTermsOfUseLinkIsValid() {
        WebElement termsLink = aboutPage.getTermsOfUseLink();
        assertNotNull(termsLink, "Terms of Use link should exist");
        assertTrue(termsLink.isDisplayed(), "Terms of Use link should be displayed");
        
        String linkText = LinkValidator.getLinkText(termsLink);
        System.out.println("Testing Terms of Use link: " + linkText);
        
        assertTrue(LinkValidator.isLinkValid(termsLink), 
                "Terms of Use link should be valid");
    }
    
    @Test
    @DisplayName("About Page - Social Media section is displayed")
    public void testSocialMediaSectionIsDisplayed() {
        if (aboutPage.isSocialMediaSectionDisplayed()) {
            List<WebElement> socialLinks = aboutPage.getSocialMediaLinks();
            
            assertFalse(socialLinks.isEmpty(), "Social media section should contain links");
            
            for (WebElement link : socialLinks) {
                assertTrue(link.isDisplayed(), "Social media link should be displayed");
                
                WebElement button = link.findElement(org.openqa.selenium.By.tagName("button"));
                assertTrue(button.isEnabled(), "Social media button should be enabled");
                
                String linkText = LinkValidator.getLinkText(link);
                System.out.println("Testing social media link: " + linkText);
                
                assertTrue(LinkValidator.isLinkValid(link), 
                        "Social media link should be valid: " + linkText);
            }
        }
    }
    
    @Test
    @DisplayName("About Page - All hyperlinks are valid")
    public void testAllLinksAreValid() {
        List<WebElement> links = aboutPage.getAllLinks();
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
