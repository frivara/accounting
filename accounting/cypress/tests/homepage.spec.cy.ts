describe('Homepage', () => {
    beforeEach(() => {
        // Visit the homepage
        cy.visit('/');
    });

    it('should greet the user by name', () => {

        // Visit the home page
        cy.visit('/');

        // Verify that the user is greeted by name
        cy.get('.greeting').should('contain', 'Hello, admin@email.com!');
    });

    it('should display all three options: create a new fiscal year book, see the earlier fiscal years, and see a list of accounts', () => {

        // Visit the home page
        cy.visit('/');

        // Verify that the option to create a new fiscal year book is displayed
        cy.get('.create-fiscal-year-book').should('be.visible');

        // Verify that the option to see the earlier fiscal years is displayed
        cy.get('.see-earlier-fiscal-years').should('be.visible');

        // Verify that the option to see a list of accounts is displayed
        cy.get('.see-accounts').should('be.visible');
    });

    it('should be accessible to logged-in users only', () => {
        // Visit the home page without logging in
        cy.visit('/');

        // Verify that the user is redirected to the login page
        cy.url().should('eq', 'http://localhost:3000/');
    });

    it('should redirect the user to the create fiscal year book page when they click on the "create a new fiscal year book" option', () => {
        // Log in to the application
        // ...

        // Visit the home page
        cy.visit('/');

        // Click on the "create a new fiscal year book" option
        cy.get('.create-fiscal-year-book').click();

        // Verify that the user is redirected to the create fiscal year book page
        cy.url().should('eq', 'http://localhost:3000/fiscal-year-book/new');
    });

    it('should redirect the user to the earlier fiscal years page when they click on the "see the earlier fiscal years" option', () => {
        // Log in to the application
        // ...

        // Visit the home page
        cy.visit('/');

        // Click on the "see the earlier fiscal years" option
        cy.get('.see-earlier-fiscal-years').click();

        // Verify that the user is redirected to the earlier fiscal years page
        cy.url().should('eq', 'http://localhost:3000/fiscal-year-book/list');
    });

    it('should redirect the user to the accounts page when they click on the "see a list of accounts" option', () => {
        // Log in to the application
        // ...

        // Visit the home page
        cy.visit('/');

        // Click on the "see a list of accounts" option
        cy.get('.see-accounts').click();

        // Verify that the user is redirected to the accounts page
        cy.url().should('eq', 'http://localhost:3000/accounts');
    });
});
