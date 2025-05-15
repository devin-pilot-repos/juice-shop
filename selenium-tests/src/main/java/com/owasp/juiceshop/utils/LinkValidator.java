package com.owasp.juiceshop.utils;

import org.openqa.selenium.WebElement;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

public class LinkValidator {
    
    public static boolean isLinkValid(WebElement link) {
        String url = link.getAttribute("href");
        if (url == null || url.isEmpty()) {
            return false;
        }
        
        if (url.startsWith("javascript:") || url.startsWith("#")) {
            return true;
        }
        
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("HEAD");
            connection.connect();
            int responseCode = connection.getResponseCode();
            return responseCode < 400;
        } catch (IOException e) {
            return false;
        }
    }
    
    public static String getLinkText(WebElement link) {
        String text = link.getText().trim();
        if (text.isEmpty()) {
            text = link.getAttribute("aria-label");
            if (text == null || text.isEmpty()) {
                text = link.getAttribute("title");
                if (text == null || text.isEmpty()) {
                    text = link.getAttribute("href");
                }
            }
        }
        return text;
    }
}
