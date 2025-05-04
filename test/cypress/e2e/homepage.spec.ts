describe('OWASP Juice Shop Homepage Tests', () => {
  beforeEach(() => {
    cy.visit('/#/')
    cy.get('mat-grid-list').should('be.visible')
  })

  it('should display the title and navigation bar', () => {
    cy.get('app-navbar').should('be.visible')
    cy.get('.logo').should('be.visible')
    cy.get('mat-toolbar').contains('OWASP Juice Shop')
  })

  it('should display the product grid with items', () => {
    cy.get('app-search-result').should('be.visible')
    cy.get('mat-grid-list').should('be.visible')
    cy.get('mat-grid-tile').should('have.length.at.least', 1)
  })

  it('should allow searching for products', () => {
    cy.get('#searchQuery').click()
    cy.get('app-mat-search-bar input').type('apple{enter}')
    cy.url().should('include', '/search')
    cy.get('mat-grid-tile').should('exist')
  })

  it('should navigate to login page when clicking account', () => {
    cy.get('#navbarAccount').click()
    cy.get('#navbarLoginButton').click()
    cy.url().should('include', '/login')
    cy.get('#email').should('be.visible')
    cy.get('#password').should('be.visible')
  })

  it('should display product details when clicking on a product', () => {
    cy.get('mat-grid-tile').should('be.visible')
    cy.get('mat-grid-tile img.img-thumbnail').first().click({ force: true })
    cy.wait(1000)
    cy.get('mat-dialog-container').should('be.visible')
  })
})
