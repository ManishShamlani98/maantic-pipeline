# Tests for LibrarySystem/src/test/java/com/example/library/LibraryTest.java

# QA Analysis for LibrarySystem Code

## === BDD SCENARIOS (GHERKIN) ===

```gherkin
Feature: Library Management System
  As a librarian
  I want to manage books in the library system
  So that I can track inventory and lending operations

  @smoke @regression
  Scenario: Add new book to library
    Given I have an empty library
    When I add a book with ISBN "978-0-06-112008-4", title "To Kill a Mockingbird", author "Harper Lee", year 1960
    Then the total number of books should be 1
    And the book should be available for checkout

  @smoke @regression  
  Scenario: Prevent duplicate books by ISBN
    Given I have a library with a book ISBN "978-0-06-112008-4"
    When I try to add another book with the same ISBN "978-0-06-112008-4"
    Then I should get a DuplicateBookException
    And the total number of books should remain 1

  @regression
  Scenario: Find books by author case-insensitive
    Given I have a library with books by "Tolkien" and "Harper Lee"
    When I search for books by author "tolkien"
    Then I should find 1 book
    And the book author should be "Tolkien"

  @smoke @regression
  Scenario: Check out and return book workflow
    Given I have a library with an available book ISBN "978-0-06-112008-4"
    When I check out the book
    Then the book should not be available
    When I return the book
    Then the book should be available again

  @edge @regression
  Scenario: Remove checked out book clears state
    Given I have a library with a book ISBN "978-0-06-112008-4"
    And the book is checked out
    When I remove the book from library
    And I add the same book back to library
    Then the book should be available for checkout
```

## === TDD TEST SCRIPT ===

```java
package com.example.library;

import org.junit.jupiter.api.*;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

/**
 * LibraryTest — Complete JUnit 5 TDD test suite
 * Tests Library functionality with comprehensive coverage
 */
class LibraryTest {

    private Library lib;
    private Book book1, book2;

    @BeforeEach
    void setUp() throws Exception {
        lib = new Library();
        book1 = new Book("978-0-06-112008-4", "To Kill a Mockingbird", "Harper Lee", 1960);
        book2 = new Book("978-0-618-00222-3", "The Lord of the Rings", "Tolkien", 2001);
        lib.addBook(book1);
        lib.addBook(book2);
    }

    @Nested @DisplayName("addBook()")
    class AddBookTests {
        
        @Test @DisplayName("duplicate ISBN throws DuplicateBookException [catches BUG-1]")
        void duplicateIsbn() {
            assertThrows(Library.DuplicateBookException.class, () -> lib.addBook(book1),
                "Should throw DuplicateBookException when adding book with existing ISBN");
        }
        
        @Test @DisplayName("totalBooks increases after add")
        void totalIncreases() {
            assertEquals(2, lib.totalBooks(), 
                "Total books should be 2 after adding 2 books in setUp");
        }
        
        @Test @DisplayName("throws on blank ISBN in Book constructor")
        void blankIsbn() {
            assertThrows(IllegalArgumentException.class, 
                () -> new Book("", "Title", "Author", 2000),
                "Should throw IllegalArgumentException for blank ISBN");
        }

        @Test @DisplayName("throws on null ISBN in Book constructor")
        void nullIsbn() {
            assertThrows(IllegalArgumentException.class,
                () -> new Book(null, "Title", "Author", 2000),
                "Should throw IllegalArgumentException for null ISBN");
        }
    }

    @Nested @DisplayName("removeBook()")
    class RemoveBookTests {
        
        @Test @DisplayName("throws BookNotFoundException on missing isbn")
        void missingIsbn() {
            assertThrows(Library.BookNotFoundException.class,
                () -> lib.removeBook("999-nonexistent-isbn"),
                "Should throw BookNotFoundException for non-existent ISBN");
        }
        
        @Test @DisplayName("isAvailable false after remove")
        void unavailableAfterRemove() throws Exception {
            String isbn = book1.getIsbn();
            lib.removeBook(isbn);
            assertFalse(lib.isAvailable(isbn), 
                "Book should not be available after removal");
        }
        
        @Test @DisplayName("checked-out state cleared after remove [catches BUG-2]")
        void checkedOutStateCleared() throws Exception {
            String isbn = book1.getIsbn();
            String title = book1.getTitle();
            String author = book1.getAuthor();
            int year = book1.getYear();
            
            // Check out the book
            lib.checkOut(isbn);
            // Remove the book
            lib.removeBook(isbn);
            // Add the same book back
            Book newBook = new Book(isbn, title, author, year);
            lib.addBook(newBook);
            
            // Should be available for checkout (state cleared)
            assertTrue(lib.isAvailable(isbn),
                "Re-added book should be available after previous checked-out copy was removed");
        }

        @Test @DisplayName("total books decreases after remove")
        void totalDecreases() throws Exception {
            lib.removeBook(book1.getIsbn());
            assertEquals(1, lib.totalBooks(),
                "Total books should decrease after removal");
        }
    }

    @Nested @DisplayName("findByAuthor()")
    class FindByAuthorTests {
        
        @Test @DisplayName("case-insensitive search [catches BUG-3]")
        void caseInsensitive() {
            List<Book> books = lib.findByAuthor("tolkien");
            assertEquals(1, books.size(),
                "Should find 1 book when searching 'tolkien' (case-insensitive)");
            assertEquals("Tolkien", books.get(0).getAuthor(),
                "Found book should be by Tolkien");
        }
        
        @Test @DisplayName("returns empty list for unknown author")
        void unknownAuthor() {
            List<Book> books = lib.findByAuthor("Rowling");
            assertTrue(books.isEmpty(),
                "Should return empty list for unknown author");
        }
        
        @Test @DisplayName("null author returns empty list")
        void nullAuthor() {
            List<Book> books = lib.findByAuthor(null);
            assertTrue(books.isEmpty(),
                "Should return empty list for null author");
        }

        @Test @DisplayName("exact author name match")
        void exactMatch() {
            List<Book> books = lib.findByAuthor("Harper Lee");
            assertEquals(1, books.size(),
                "Should find exact author name match");
        }
    }

    @Nested @DisplayName("checkOut() / returnBook()")
    class CheckOutTests {
        
        @Test @DisplayName("book unavailable after checkout [catches BUG-6]")
        void unavailableAfterCheckout() throws Exception {
            String isbn = book1.getIsbn();
            lib.checkOut(isbn);
            assertFalse(lib.isAvailable(isbn),
                "Book should not be available after checkout");
        }
        
        @Test @DisplayName("double checkout throws BookUnavailableException [catches BUG-4]")
        void doubleCheckoutThrows() throws Exception {
            String isbn = book1.getIsbn();
            lib.checkOut(isbn);
            assertThrows(Library.BookUnavailableException.class,
                () -> lib.checkOut(isbn),
                "Should throw BookUnavail