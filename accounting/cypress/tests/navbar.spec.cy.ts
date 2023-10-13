describe("Navbar", () => {
    it("should be displayed on all pages", () => {
        cy.visit("/");
        cy.get(".navbar").should("be.visible");

        cy.visit("/accounts");
        cy.get(".navbar").should("be.visible");

        cy.visit("/accounts/new");
        cy.get(".navbar").should("be.visible");

        cy.visit("/accounts/list");
        cy.get(".navbar").should("be.visible");
    });

    it("should have links to the home page, the accounts page, and the log out page", () => {
        cy.visit("/");

        cy.get(".navbar").contains("Home").should("have.attr", "href", "/");
        cy.get(".navbar").contains("Accounts").should("have.attr", "href", "/accounts");
        cy.get(".navbar").contains("Log out").should("have.attr", "href", "/logout");
    });

    it("should log out the user when the log out button is clicked", () => {
        cy.visit("/");

        cy.get(".navbar").contains("Log out").click();

        cy.url().should("eq", "/login");
    });
});
