// cypress/integration/new_fiscal_year_spec.js

describe("New Fiscal Year Creation", () => {
  beforeEach(() => {
    cy.visit(`/accounting/eVm6Vp5RUPZnUqwg62li`);
  });

  it("allows a user to enter a new fiscal year", () => {
    // Set start and end date for the fiscal year
    cy.get("start-date").type("2023-01-01");
    cy.get("end-date").type("2023-12-31");

    // Add an account with code and balance
    cy.get('input[name="accountCode"]').type("1234");
    cy.get('input[name="accountName"]').type("Test Account");
    cy.get('input[name="balance"]').type("1000");
    cy.get("button").contains("Add Account").click();

    // Verify the account has been added to the list
    cy.get("table").find("tbody tr").should("have.length", 1);
    cy.get("table")
      .find("tbody tr:last")
      .should("contain", "1234")
      .and("contain", "1000");

    // Submit the form to create a new fiscal year
    cy.get("button").contains("Create Fiscal Year").click();

    // Check for a success message or for a redirect to confirm fiscal year creation
    // This will depend on how your application provides feedback to the user
    // For example:
    // cy.get('.success-message').should('contain', 'Fiscal year created successfully');
    // or check the URL if it's supposed to redirect:
    // cy.url().should('include', '/some-expected-path');
  });

  // Additional tests for other validation and error handling can be added here
});
