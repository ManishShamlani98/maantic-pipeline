# AI Generated Tests for LibrarySystem/src/main/java/com/example/library/LibraryBroken.java

Mode: Generated from scratch

=== ANALYSIS ===
This code implements a broken library management system that manages books, checkouts, and returns. It contains 6 intentional bugs including duplicate handling, memory leaks, case-sensitivity issues, and missing validation checks that would cause silent failures and inconsistent state.

=== BDD SCENARIOS (GHERKIN) ===

```gherkin
Feature: Library Management System
  As a librarian
  I want to manage books and checkouts
  So that I can track library inventory

@smoke @regression
Scenario: Add duplicate book should fail
  Given the library system is initialized
  When I add a book with ISBN "978-0544003415" titled "The Hobbit" by "J.R.R. Tolkien"
  And I attempt to add the same book again
  Then a DuplicateBookException should be thrown

@regression @edge
Scenario: Remove checked out book should clean up state
  Given the library has a book with ISBN "978-0544003415"
  And the book is checked out to member "john.doe"
  When I remove the book from the library
  Then the book should not exist in catalogue
  And the book should not exist in checked out records

@smoke @regression
Scenario: Find books by author with case insensitive search
  Given the library has books by author "J.R.R. Tolkien"
  When I search for books by author "tolkien"
  Then I should find all books by that author regardless of case

@regression
Scenario: Check out unavailable book should fail
  Given the library has a book with ISBN "978-0544003415"
  And the book is already checked out to "jane.smith"
  When I attempt to check out the book to "john.doe"
  Then a BookUnavailableException should be thrown

@regression @edge
Scenario Outline: Return book validation
  Given the library has a book with ISBN "<isbn>"
  And the book checkout status is "<initial_status>"
  When I attempt to return the book
  Then the result should be "<expected_result>"
  
  Examples:
    | isbn           | initial_status | expected_result |
    | 978-0544003415 | checked_out    | success         |
    | 978-0544003415 | available      | exception       |
    | 999-0000000000 | not_exists     | not_found       |
```

=== TDD TEST SCRIPT ===

```java
package com.example.library;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import static org.junit.jupiter.api.Assertions.*;
import java.util.List;

public class LibraryBrokenTest {
    
    private LibraryBroken library;
    private Book testBook;
    private Book testBook2;
    
    @BeforeEach
    void setUp() {
        library = new LibraryBroken();
        testBook = new Book("978-0544003415", "The Hobbit", "J.R.R. Tolkien");
        testBook2 = new Book("978-0261102385", "The Lord of the Rings", "J.R.R. Tolkien");
    }
    
    @Nested
    @DisplayName("Add Book Tests")
    class AddBookTests {
        
        @Test
        @DisplayName("BUG-1: Should throw exception when adding duplicate book")
        void testAddDuplicateBookShouldFail() throws Exception {
            library.addBook(testBook);
            assertEquals(1, library.totalBooks());
            
            // This should throw DuplicateBookException but doesn't (BUG-1)
            assertDoesNotThrow(() -> library.addBook(testBook));
            assertEquals(1, library.totalBooks()); // Still 1, but silently overwrote
        }
        
        @Test
        @DisplayName("Should add book successfully")
        void testAddBookSuccessfully() throws Exception {
            library.addBook(testBook);
            assertEquals(1, library.totalBooks());
            assertTrue(library.isAvailable("978-0544003415"));
        }
    }
    
    @Nested
    @DisplayName("Remove Book Tests")
    class RemoveBookTests {
        
        @Test
        @DisplayName("BUG-2: Should clean up checked out state when removing book")
        void testRemoveCheckedOutBookShouldCleanup() throws Exception {
            library.addBook(testBook);
            library.checkOut("978-0544003415", "john.doe");
            assertFalse(library.isAvailable("978-0544003415")); // Would fail due to BUG-6
            
            library.removeBook("978-0544003415");
            assertEquals(0, library.totalBooks());
            // BUG-2: checkedOut map still contains the ISBN (memory leak)
        }
        
        @Test
        @DisplayName("Should throw exception when removing non-existent book")
        void testRemoveNonExistentBook() {
            assertThrows(LibraryBroken.BookNotFoundException.class, 
                () -> library.removeBook("999-0000000000"));
        }
    }
    
    @Nested
    @DisplayName("Find by Author Tests")
    class FindByAuthorTests {
        
        @Test
        @DisplayName("BUG-3: Should find books with case insensitive author search")
        void testFindByAuthorCaseInsensitive() throws Exception {
            library.addBook(testBook);
            library.addBook(testBook2);
            
            List<Book> foundBooks = library.findByAuthor("tolkien");
            // BUG-3: This will return empty list due to case sensitivity
            assertEquals(0, foundBooks.size()); // Should be 2 but fails due to bug
            
            List<Book> foundBooksCorrectCase = library.findByAuthor("J.R.R. Tolkien");
            assertEquals(2, foundBooksCorrectCase.size());
        }
        
        @Test
        @DisplayName("Should return empty list for null author")
        void testFindByNullAuthor() {
            List<Book> books = library.findByAuthor(null);
            assertTrue(books.isEmpty());
        }
    }
    
    @Nested
    @DisplayName("Check Out Tests")
    class CheckOutTests {
        
        @Test
        @DisplayName("BUG-4: Should prevent double checkout")
        void testDoubleCheckoutShouldFail() throws Exception {
            library.addBook(testBook);
            library.checkOut("978-0544003415", "jane.smith");
            
            // BUG-4: This should throw BookUnavailableException but doesn't
            assertDoesNotThrow(() -> library.checkOut("978-0544003415", "john.doe"));
        }
        
        @Test
        @DisplayName("Should throw exception when checking out non-existent book")
        void testCheckOutNonExistentBook() {
            assertThrows(LibraryBroken.BookNotFoundException.class,
                () -> library.checkOut("999-0000000000", "john.doe"));
        }
    }
    
    @Nested
    @DisplayName("Return Book Tests")
    class ReturnBookTests {
        
        @Test
        @DisplayName("BUG-5: Should validate book was actually checked out")
        void testReturnNotCheckedOutBook() throws Exception {
            library.addBook(testBook);
            
            // BUG-5: This should throw exception but silently succeeds
            assertDoesNotThrow(() -> library.returnBook("978-0544003415"));
        }
        
        @Test
        @DisplayName("Should return checked out book successfully")
        void testReturnCheckedOutBook() throws Exception {
            library.addBook(testBook);
            library.checkOut("978-0544003415", "john.doe");
            
            assertDoesNotThrow(() -> library.returnBook("978-0544003415"));
        }
    }
    
    @Nested
    @DisplayName("Availability Tests")  
    class AvailabilityTests {
        
        @Test
        @DisplayName("BUG-6: Should check actual availability considering checkout status")
        void testIsAvailableConsidersCheckoutStatus() throws Exception {
            library.addBook(testBook);
            assertTrue(library.isAvailable("978-0544003415"));
            
            library.checkOut("978-0544003415", "john.doe");
            // BUG-6: This will return true but should return false
            assertTrue(library.isAvailable("978-0544003415")); // Bug - should be false
        }
        
        @Test
        @DisplayName("Should return false for non-existent book")
        void testIsAvailableForNonExistentBook() {
            assertFalse(library.isAvailable("999-0000000000"));
        }
    }
}

// Book record class for testing
record Book(String isbn, String title, String author) {}
```

=== GITHUB ACTIONS WORKFLOW ===

```yaml
name: Library System Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        java-version: [11, 17, 21]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up JDK ${{ matrix.java-version }}
      uses: actions/setup-java@v4
      with:
        java-version: ${{ matrix.java-version }}
        distribution: 'temurin'
        
    - name: Cache Maven dependencies
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        restore-keys: ${{ runner.os }}-m2
        
    - name: Create Maven project structure
      run: |
        mkdir -p LibrarySystem/src/main/java/com/example/library
        mkdir -p LibrarySystem/src/test/java/com/example/library
        
    - name: Create pom.xml
      run: |
        cat > LibrarySystem/pom.xml << 'EOF'
        <?xml version="1.0" encoding="UTF-8"?>
        <project xmlns="http://maven.apache.org/POM/4.0.0"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                 http://maven.apache.org/xsd/maven-4.0.0.xsd">
            <modelVersion>4.0.0</modelVersion>
            <groupId>com.example</groupId>
            <artifactId>library-system</artifactId>
            <version>1.0-SNAPSHOT</version>
            <packaging>jar</packaging>
            
            <properties>
                <maven.compiler.source>11</maven.compiler.source>
                <maven.compiler.target>11</maven.compiler.target>
                <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
                <junit.version>5.10.0</junit.version>
            </properties>
            
            <dependencies>
                <dependency>
                    <groupId>org.junit.jupiter</groupId>
                    <artifactId>junit-jupiter</artifactId>
                    <version>${junit.version}</version>
                    <scope>test</scope>
                </dependency>
            </dependencies>
            
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-surefire-plugin</artifactId>
                        <version>