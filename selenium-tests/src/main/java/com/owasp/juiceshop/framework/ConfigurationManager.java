package com.owasp.juiceshop.framework;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ConfigurationManager {
    private static final Properties properties = new Properties();
    
    static {
        try (InputStream inputStream = ConfigurationManager.class
                .getClassLoader()
                .getResourceAsStream("config.properties")) {
            if (inputStream != null) {
                properties.load(inputStream);
            } else {
                System.err.println("config.properties file not found in classpath");
            }
        } catch (IOException e) {
            System.err.println("Failed to load config.properties: " + e.getMessage());
        }
    }
    
    public static String getBaseUrl() {
        return getProperty("base.url", "http://localhost:3000");
    }
    
    public static int getImplicitWaitSeconds() {
        return Integer.parseInt(getProperty("implicit.wait.seconds", "10"));
    }
    
    public static int getPageLoadTimeoutSeconds() {
        return Integer.parseInt(getProperty("page.load.timeout.seconds", "30"));
    }
    
    private static String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
}
