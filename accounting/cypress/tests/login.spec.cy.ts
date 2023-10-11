describe('login page', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('/login');
  });


  it('should display an error message if the user enters an incorrect email or password', () => {

    // Enter an incorrect email address
    cy.get('input[name="email"]').type('invalid@email.com');

    // Enter an incorrect password
    cy.get('input[name="password"]').type('invalid-password');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify that the user is still on the login page
    cy.url().should('eq', '/login');

    // Verify that the user is displayed an error message
    cy.get('.error-message').should('be.visible');
  });

  it('should validate the login form correctly and log in the user', () => {
    // Validate the login form
    cy.get('button[type="submit"]').click();
    cy.get('input[name="email"]').should('have.class', 'is-invalid');
    cy.get('input[name="password"]').should('have.class', 'is-invalid');

    // Log in with valid credentials
    cy.get('input[name="email"]').type('admin@email.com');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();

    // Verify that the user is logged in
    cy.url().should('eq', '/');
  });

  it('should validate empty fields in the login form', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[name="email"]').should('have.class', 'is-invalid');
    cy.get('input[name="password"]').should('have.class', 'is-invalid');
  });



})