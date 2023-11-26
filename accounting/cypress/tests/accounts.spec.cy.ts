describe("Accounts page", () => {
  beforeEach(() => {
    // Visit the accounts-page
    cy.visit("/accounting");
  });

  it("should be on the /accounts page", () => {
    cy.visit("/accounts");
    cy.url().should("eq", "http://localhost:3000/accounting");
  });

  it("should be able to create a new account", () => {
    cy.visit("/accounts");

    // Enter a name for the new account
    cy.get("#name").type("New account");

    // Select an accounting plan from the drop-down menu
    cy.get("#accountingPlan").select("Cash accounting");

    // Click the create account button
    cy.get("#createAccountButton").click();

    // Verify that the new account is displayed in the list of previously created accounts
    cy.get(".account-list").contains("New account");
  });

  it("should be able to view an account's details", () => {
    cy.visit("/accounts");

    // Click on the first account in the list
    cy.get(".account-list").first().click();

    // Verify that the account details page is displayed
    cy.get(".account-details").should("be.visible");

    // Verify that the account details page displays the correct information for the selected account
    cy.get(".account-name").should("contain", "New account");
    cy.get(".accounting-plan").should("contain", "Cash accounting");
  });
});
