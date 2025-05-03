/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ConfigurationService, type Config } from '../configuration.service'
import { environment } from '../../../environments/environment'

describe('ConfigurationService', () => {
  let service: ConfigurationService
  let httpMock: HttpTestingController
  const hostServer = environment.hostServer

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigurationService]
    })
    service = TestBed.inject(ConfigurationService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getApplicationConfiguration', () => {
    it('should return application configuration', () => {
      const mockConfig: Config = {
        server: {
          port: 3000
        },
        application: {
          domain: 'juice-sh.op',
          name: 'OWASP Juice Shop',
          logo: 'JuiceShop_Logo.png',
          favicon: 'favicon_v2.ico',
          theme: 'bluegrey-lightgreen',
          showVersionNumber: true,
          showGitHubLinks: true,
          localBackupEnabled: true,
          numberOfRandomFakeUsers: 0,
          altcoinName: 'Juicycoin',
          privacyContactEmail: 'donotreply@owasp-juice.shop',
          social: {
            blueSkyUrl: '',
            mastodonUrl: '',
            twitterUrl: 'https://twitter.com/owasp_juiceshop',
            facebookUrl: 'https://www.facebook.com/owasp.juiceshop',
            slackUrl: 'https://owasp.org/slack/invite',
            redditUrl: 'https://www.reddit.com/r/owasp_juiceshop',
            pressKitUrl: 'https://github.com/OWASP/owasp-swag/tree/master/projects/juice-shop',
            nftUrl: 'https://opensea.io/collection/juice-shop',
            questionnaireUrl: ''
          },
          recyclePage: {
            topProductImage: 'fruit_press.jpg',
            bottomProductImage: 'apple_pressings.jpg'
          },
          welcomeBanner: {
            showOnFirstStart: true,
            title: 'Welcome to OWASP Juice Shop!',
            message: 'This application contains a vast number of security vulnerabilities.'
          },
          cookieConsent: {
            message: 'This website uses cookies to ensure you get the best experience.',
            dismissText: 'I agree',
            linkText: 'Learn more',
            linkUrl: 'https://www.cookiesandyou.com'
          },
          securityTxt: {
            contact: 'mailto:donotreply@owasp-juice.shop',
            encryption: 'https://keybase.io/bkimminich/pgp_keys.asc?fingerprint=19c01cb7157e4645e9e2c863062a85a8cbfbdcda',
            acknowledgements: 'https://hackerone.com/juice-shop/thanks'
          },
          promotion: {
            video: 'owasp_promo.mp4',
            subtitles: 'owasp_promo.vtt'
          },
          easterEggPlanet: {
            name: 'Orangeuze',
            overlayMap: 'orangemap2k.jpg'
          },
          googleOauth: {
            clientId: 'XXXXXXX',
            authorizedRedirects: []
          }
        },
        challenges: {
          showSolvedNotifications: true,
          showHints: true,
          showMitigations: true,
          codingChallengesEnabled: 'solved',
          restrictToTutorialsFirst: false,
          safetyMode: 'off',
          overwriteUrlForProductTamperingChallenge: '',
          showFeedbackButtons: true
        },
        hackingInstructor: {
          isEnabled: true,
          avatarImage: 'juicyBot.png'
        },
        products: [],
        memories: [],
        ctf: {
          showFlagsInNotifications: false,
          showCountryDetailsInNotifications: 'none',
          countryMapping: []
        }
      }
      
      const mockResponse = { config: mockConfig }
      
      service.getApplicationConfiguration().subscribe(config => {
        expect(config).toEqual(mockConfig)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/admin/application-configuration`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should cache the configuration after first request', () => {
      const mockConfig: Config = {
        server: { port: 3000 },
        application: {
          domain: 'juice-sh.op',
          name: 'OWASP Juice Shop',
          logo: 'JuiceShop_Logo.png',
          favicon: 'favicon_v2.ico',
          theme: 'bluegrey-lightgreen',
          showVersionNumber: true,
          showGitHubLinks: true,
          localBackupEnabled: true,
          numberOfRandomFakeUsers: 0,
          altcoinName: 'Juicycoin',
          privacyContactEmail: 'donotreply@owasp-juice.shop',
          social: {
            blueSkyUrl: '',
            mastodonUrl: '',
            twitterUrl: 'https://twitter.com/owasp_juiceshop',
            facebookUrl: 'https://www.facebook.com/owasp.juiceshop',
            slackUrl: 'https://owasp.org/slack/invite',
            redditUrl: 'https://www.reddit.com/r/owasp_juiceshop',
            pressKitUrl: 'https://github.com/OWASP/owasp-swag/tree/master/projects/juice-shop',
            nftUrl: 'https://opensea.io/collection/juice-shop',
            questionnaireUrl: ''
          },
          recyclePage: {
            topProductImage: 'fruit_press.jpg',
            bottomProductImage: 'apple_pressings.jpg'
          },
          welcomeBanner: {
            showOnFirstStart: true,
            title: 'Welcome to OWASP Juice Shop!',
            message: 'This application contains a vast number of security vulnerabilities.'
          },
          cookieConsent: {
            message: 'This website uses cookies to ensure you get the best experience.',
            dismissText: 'I agree',
            linkText: 'Learn more',
            linkUrl: 'https://www.cookiesandyou.com'
          },
          securityTxt: {
            contact: 'mailto:donotreply@owasp-juice.shop',
            encryption: 'https://keybase.io/bkimminich/pgp_keys.asc?fingerprint=19c01cb7157e4645e9e2c863062a85a8cbfbdcda',
            acknowledgements: 'https://hackerone.com/juice-shop/thanks'
          },
          promotion: {
            video: 'owasp_promo.mp4',
            subtitles: 'owasp_promo.vtt'
          },
          easterEggPlanet: {
            name: 'Orangeuze',
            overlayMap: 'orangemap2k.jpg'
          },
          googleOauth: {
            clientId: 'XXXXXXX',
            authorizedRedirects: []
          }
        },
        challenges: {
          showSolvedNotifications: true,
          showHints: true,
          showMitigations: true,
          codingChallengesEnabled: 'solved',
          restrictToTutorialsFirst: false,
          safetyMode: 'off',
          overwriteUrlForProductTamperingChallenge: '',
          showFeedbackButtons: true
        },
        hackingInstructor: {
          isEnabled: true,
          avatarImage: 'juicyBot.png'
        },
        products: [],
        memories: [],
        ctf: {
          showFlagsInNotifications: false,
          showCountryDetailsInNotifications: 'none',
          countryMapping: []
        }
      }
      
      const mockResponse = { config: mockConfig }
      
      service.getApplicationConfiguration().subscribe()
      const req1 = httpMock.expectOne(`${hostServer}/rest/admin/application-configuration`)
      req1.flush(mockResponse)
      
      service.getApplicationConfiguration().subscribe()
      httpMock.expectNone(`${hostServer}/rest/admin/application-configuration`)
    })
  })
})
