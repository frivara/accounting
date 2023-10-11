describe('Homepage', () => {
    beforeEach(() => {
        // Visit the homepage
        cy.visit('/');
    });

    it('should greet the user', () => {
        cy.get('[data-cy=greeting]')
            .should('be.visible')
            .and('contain', 'Välkommen till Bokföring 2.0!');
    });

    it('should inform the user about the website', () => {
        cy.get('[data-cy=info]')
            .should('be.visible')
            .and('contain', 'När du vill bokföra utan krångel');  // Replace with actual text
    });

    it('should provide an option to log in', () => {
        cy.get('[data-cy=login-button]')
            .should('be.visible')
            .and('contain', 'Log In')
            .click();

        // Verify redirection to login page
        cy.url().should('include', '/login');
    });

    it('should provide an option to register', () => {
        cy.get('[data-cy=register-button]')
            .should('be.visible')
            .and('contain', 'Register')
            .click();

        // Verify redirection to registration page
        cy.url().should('include', '/register');
    });
});
