# AI Generated Tests for LibrarySystem/src/main/java/com/example/library/LibraryBroken.java

Mode: Generated from scratch

=== ANALYSIS ===

This code implements a broken library management system with intentional bugs. The LibraryBroken class manages a book catalogue and checkout system, allowing operations like adding/removing books, finding by author, checking out/returning books, and checking availability. However, it contains 6 critical bugs including missing duplicate checks, memory leaks, case-sensitive searches, and incorrect availability logic.

=== BDD SCENARIOS (GHERKIN) ===

```gherkin
Feature: Library Management System
  As a librarian
  I want to manage books and checkouts
  So that I can track library inventory and borrowers

  @smoke @regression
  Scenario: Add duplicate book should prevent overwriting
    Given a library system
    And a book exists with ISBN "978-0345339683" titled "The Hobbit" by "Tolkien"
    When I attempt to add another book with the same ISBN "978-0345339683"
    Then a DuplicateBookException should be thrown
    And the original book details should remain unchanged

  @smoke @regression
  Scenario: Remove checked out book should clean up checkout records
    Given a library system
    And a book with ISBN "978-0345339683" is in the catalogue
    And the book is checked out to member "john.doe"
    When I remove the book from the catalogue
    Then the book should not appear in checkout records
    And total books count should decrease by 1

  @regression @edge
  Scenario Outline: Find books by author should be case insensitive
    Given a library system
    And a book by author "<stored_author>" exists in the catalogue
    When I search for books by author "<search_author>"
    Then the book should be found in search results

    Examples:
      | stored_author | search_author |
      | Tolkien       | tolkien       |
      | J.K. Rowling  | j.k. rowling  |
      | SHAKESPEARE   | shakespeare   |

  @smoke @regression
  Scenario: Checkout already checked out book should fail
    Given a library system
    And a book with ISBN "978-0345339683" exists in the catalogue
    And the book is already checked out to member "jane.smith"
    When member "john.doe" attempts to check out the same book
    Then a BookUnavailableException should be thrown
    And the book should remain checked out to "jane.smith"

  @edge @regression
  Scenario: Return book that was never checked out should fail
    Given a library system
    And a book with ISBN "978-0345339683" exists in the catalogue
    And the book is available (not checked out)
    When I attempt to return the book
    Then a BookUnavailableException should be thrown
    And the book should remain available
```

=== TDD TEST SCRIPT ===

```java
package com.example.library;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class LibraryBrokenTest {

    private LibraryBroken library;
    private Book testBook;
    private Book anotherBook;

    @BeforeEach
    void setUp() {
        library = new LibraryBroken();
        testBook = new Book("978-0345339683", "The Hobbit", "Tolkien");
        anotherBook = new Book("978-0439708180", "Harry Potter", "J.K. Rowling");
    }

    @Test
    @DisplayName("BUG-1: Adding duplicate book should throw DuplicateBookException")
    void testAddDuplicateBook() throws Exception {
        // First addition should succeed
        library.addBook(testBook);
        assertEquals(1, library.totalBooks());

        // Second addition with same ISBN should throw exception
        Book duplicateBook = new Book("978-0345339683", "Different Title", "Different Author");
        
        assertThrows(LibraryBroken.DuplicateBookException.class, () -> {
            library.addBook(duplicateBook);
        });
        
        // Original book should remain unchanged
        assertEquals(1, library.totalBooks());
    }

    @Test
    @DisplayName("BUG-2: Removing checked out book should clean checkout records")
    void testRemoveCheckedOutBook() throws Exception {
        library.addBook(testBook);
        library.checkOut("978-0345339683", "john.doe");
        
        // Remove book from catalogue
        library.removeBook("978-0345339683");
        
        // Book should not be available (this will fail due to BUG-6 as well)
        assertFalse(library.isAvailable("978-0345339683"));
        assertEquals(0, library.totalBooks());
    }

    @ParameterizedTest
    @CsvSource({
        "Tolkien, tolkien",
        "J.K. Rowling, j.k. rowling",
        "SHAKESPEARE, shakespeare"
    })
    @DisplayName("BUG-3: Find by author should be case insensitive")
    void testFindByAuthorCaseInsensitive(String storedAuthor, String searchAuthor) throws Exception {
        Book book = new Book("978-1234567890", "Test Book", storedAuthor);
        library.addBook(book);
        
        List<Book> results = library.findByAuthor(searchAuthor);
        
        assertEquals(1, results.size(), 
            "Should find book regardless of case, but case-sensitive search will fail");
        assertEquals(book, results.get(0));
    }

    @Test
    @DisplayName("BUG-4: Checkout unavailable book should throw BookUnavailableException")
    void testCheckoutUnavailableBook() throws Exception {
        library.addBook(testBook);
        
        // First checkout should succeed
        library.checkOut("978-0345339683", "jane.smith");
        
        // Second checkout should fail
        assertThrows(LibraryBroken.BookUnavailableException.class, () -> {
            library.checkOut("978-0345339683", "john.doe");
        });
    }

    @Test
    @DisplayName("BUG-5: Return book that was never checked out should fail")
    void testReturnNeverCheckedOutBook() throws Exception {
        library.addBook(testBook);
        
        // Book is available but never checked out
        assertTrue(library.isAvailable("978-0345339683"));
        
        // Returning should throw exception
        assertThrows(LibraryBroken.BookUnavailableException.class, () -> {
            library.returnBook("978-0345339683");
        });
    }

    @Test
    @DisplayName("BUG-6: isAvailable should consider checkout status")
    void testIsAvailableConsidersCheckoutStatus() throws Exception {
        library.addBook(testBook);
        
        // Initially available
        assertTrue(library.isAvailable("978-0345339683"));
        
        // After checkout, should be unavailable
        library.checkOut("978-0345339683", "john.doe");
        assertFalse(library.isAvailable("978-0345339683"), 
            "Book should be unavailable when checked out");
        
        // After return, should be available again
        library.returnBook("978-0345339683");
        assertTrue(library.isAvailable("978-0345339683"));
    }

    @Test
    @DisplayName("Test book not found scenarios")
    void testBookNotFoundScenarios() {
        String nonExistentIsbn = "978-9999999999";
        
        assertThrows(LibraryBroken.BookNotFoundException.class, () -> {
            library.removeBook(nonExistentIsbn);
        });
        
        assertThrows(LibraryBroken.BookNotFoundException.class, () -> {
            library.checkOut(nonExistentIsbn, "john.doe");
        });
        
        assertThrows(LibraryBroken.BookNotFoundException.class, () -> {
            library.returnBook(nonExistentIsbn);
        });
    }

    @Test
    @DisplayName("Test find by author edge cases")
    void testFindByAuthorEdgeCases() throws Exception {
        library.addBook(testBook);
        
        // Null author should return empty list
        List<Book> results = library.findByAuthor(null);
        assertTrue(results.isEmpty());
        
        // Non-existent author should return empty list
        results = library.findByAuthor("NonExistentAuthor");
        assertTrue(results.isEmpty());
        
        // Partial match should work
        results = library.findByAuthor("Tolk");
        assertEquals(1, results.size());
    }
}

// Book record class for testing
record Book(String isbn, String title, String author) {}
```

=== GITHUB ACTIONS WORKFLOW ===

```yaml
name: Library System CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    # Run tests daily at 2 AM UTC
    - cron: '0 2 * * *'

jobs:
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        java: [11, 17, 21]
        
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up JDK ${{ matrix.java }}
      uses: actions/setup-java@v4
      with:
        java-version: ${{ matrix.java }}
        distribution: 'temurin'
        
    - name: Cache Maven dependencies
      uses: actions/cache@v4
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        restore-keys: ${{ runner.os }}-m2
        
    - name: Run smoke tests
      working-directory: ./LibrarySystem
      run: |
        mvn clean test -Dtest="**/*Test" -Dgroups="smoke" \
          -Dmaven.test.failure.ignore=true
        
    - name: Run regression tests
      working-directory: ./LibrarySystem
      run: |
        mvn test -Dtest="**/*Test" -Dgroups="regression" \
          -Dmaven.test.failure.ignore=true
          
    - name: Run edge case tests
      working-directory: ./LibrarySystem
      run: |
        mvn test -Dtest="**/*Test" -Dgroups="edge" \
          -Dmaven.test.failure.ignore=true
        
    - name: Run all tests with coverage
      working-directory: ./LibrarySystem
      run: |
        mvn clean test jacoco:report
        
    - name: Generate test report
      uses: dorny/test-reporter@v1
      if: always()
      with:
        name: Maven Tests JDK ${{ matrix.java }}
        path: 'LibrarySystem/target/surefire-reports/*.xml'
        reporter: java-junit
        
    - name: Upload coverage to Codecov
      if: matrix.java == '17'
      uses: codecov/codecov-action@v3
      with:
        file: ./LibrarySystem/target/site/jacoco/jacoco.xml
        flags: unittests
        name: codecov-umbrella
        
    - name: Upload test artifacts
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: test-results-java-${{ matrix.java }}
        path: |
          LibrarySystem/target/surefire-reports/
          LibrarySystem/target/site/jacoco/
        retention-days: 30

  quality-gate:
    name: Quality Gate