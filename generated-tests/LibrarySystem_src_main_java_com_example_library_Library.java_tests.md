# AI Generated Tests for LibrarySystem/src/main/java/com/example/library/Library.java

Mode: TDD enhanced + BDD generated

=== ANALYSIS ===

The existing TDD test is incomplete with TODOs and appears to be cut off. The following improvements are needed:

1. **Complete the incomplete tests** - Several tests have TODOs that need implementation
2. **Add missing edge cases** - null handling, empty strings, concurrent operations
3. **Improve assertions** - More specific exception message validation
4. **Add boundary testing** - ISBN format validation, author name variations
5. **Test state consistency** - Ensure checkout/return operations maintain proper state
6. **Add performance considerations** - Large dataset handling

=== BDD SCENARIOS (GHERKIN) ===

```gherkin
Feature: Library Management System
  As a librarian
  I want to manage books and member checkouts
  So that I can maintain an organized library system

  Background:
    Given a library system is initialized
    And the following books exist in the library:
      | ISBN              | Title                   | Author      | Year |
      | 978-0-06-112008-4 | To Kill a Mockingbird  | Harper Lee  | 1960 |
      | 978-0-618-00222-3 | The Lord of the Rings  | Tolkien     | 2001 |

  Scenario: Adding a new book successfully
    When I add a book with ISBN "978-0-451-52493-5", title "1984", author "George Orwell", year 1949
    Then the book should be available in the library
    And the total number of books should be 3

  Scenario: Preventing duplicate book additions
    When I attempt to add a book with existing ISBN "978-0-06-112008-4"
    Then a DuplicateBookException should be thrown
    And the exception message should contain "ISBN already exists"

  Scenario: Removing an existing book
    When I remove the book with ISBN "978-0-06-112008-4"
    Then the book should no longer be in the library
    And the total number of books should be 1

  Scenario: Attempting to remove non-existent book
    When I attempt to remove a book with ISBN "999-invalid-isbn"
    Then a BookNotFoundException should be thrown

  Scenario: Finding books by author (case insensitive)
    When I search for books by author "harper lee"
    Then I should find 1 book
    And the book title should be "To Kill a Mockingbird"

  Scenario: Checking out an available book
    Given the book "978-0-06-112008-4" is available
    When member "john.doe" checks out the book "978-0-06-112008-4"
    Then the book should be marked as checked out
    And the book should not be available

  Scenario: Returning a checked out book
    Given the book "978-0-06-112008-4" is checked out by "john.doe"
    When the book "978-0-06-112008-4" is returned
    Then the book should be available
    And the book should not be marked as checked out

  Scenario: Attempting to check out already checked out book
    Given the book "978-0-06-112008-4" is checked out by "jane.smith"
    When member "john.doe" attempts to check out the book "978-0-06-112008-4"
    Then a BookUnavailableException should be thrown
```

=== ENHANCED TDD TEST SCRIPT ===

```java
package com.example.library;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Enhanced LibraryTest — Comprehensive TDD test suite
 */
class LibraryTest {

    private Library lib;
    private Book book1, book2, book3;

    @BeforeEach
    void setUp() throws Exception {
        lib = new Library();
        book1 = new Book("978-0-06-112008-4", "To Kill a Mockingbird", "Harper Lee", 1960);
        book2 = new Book("978-0-618-00222-3", "The Lord of the Rings", "Tolkien", 2001);
        book3 = new Book("978-0-451-52493-5", "1984", "George Orwell", 1949);
        lib.addBook(book1);
        lib.addBook(book2);
    }

    @Nested @DisplayName("addBook()")
    class AddBookTests {
        
        @Test @DisplayName("duplicate ISBN throws DuplicateBookException")
        void duplicateIsbn() {
            Library.DuplicateBookException exception = assertThrows(
                Library.DuplicateBookException.class, 
                () -> lib.addBook(book1)
            );
            assertTrue(exception.getMessage().contains("978-0-06-112008-4"));
            assertTrue(exception.getMessage().contains("ISBN already exists"));
        }

        @Test @DisplayName("successfully adds new book")
        void addNewBook() throws Exception {
            lib.addBook(book3);
            assertTrue(lib.isAvailable("978-0-451-52493-5"));
            assertEquals(3, lib.totalBooks());
        }

        @Test @DisplayName("adding null book throws NullPointerException")
        void addNullBook() {
            assertThrows(NullPointerException.class, () -> lib.addBook(null));
        }

        @Test @DisplayName("books maintain insertion order")
        void maintainsInsertionOrder() throws Exception {
            lib.addBook(book3);
            List<Book> allBooks = lib.getAllBooks();
            assertEquals("To Kill a Mockingbird", allBooks.get(0).title());
            assertEquals("The Lord of the Rings", allBooks.get(1).title());
            assertEquals("1984", allBooks.get(2).title());
        }
    }

    @Nested @DisplayName("removeBook()")
    class RemoveBookTests {

        @Test @DisplayName("successfully removes existing book")
        void removeExistingBook() throws Exception {
            lib.removeBook("978-0-06-112008-4");
            assertFalse(lib.isAvailable("978-0-06-112008-4"));
            assertEquals(1, lib.totalBooks());
        }

        @Test @DisplayName("removing non-existent book throws BookNotFoundException")
        void removeNonExistentBook() {
            Library.BookNotFoundException exception = assertThrows(
                Library.BookNotFoundException.class,
                () -> lib.removeBook("999-invalid-isbn")
            );
            assertTrue(exception.getMessage().contains("Book not found"));
            assertTrue(exception.getMessage().contains("999-invalid-isbn"));
        }

        @Test @DisplayName("removing checked out book cleans up checkout state")
        void removeCheckedOutBook() throws Exception {
            lib.checkOut("978-0-06-112008-4", "john.doe");
            lib.removeBook("978-0-06-112008-4");
            
            assertFalse(lib.isAvailable("978-0-06-112008-4"));
            assertEquals(1, lib.totalBooks());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("removing null or empty ISBN throws appropriate exception")
        void removeInvalidIsbn(String isbn) {
            assertThrows(Exception.class, () -> lib.removeBook(isbn));
        }
    }

    @Nested @DisplayName("findByAuthor()")
    class FindByAuthorTests {

        @Test @DisplayName("finds books by exact author name")
        void findByExactAuthor() {
            List<Book> books = lib.findByAuthor("Harper Lee");
            assertEquals(1, books.size());
            assertEquals("To Kill a Mockingbird", books.get(0).title());
        }

        @Test @DisplayName("search is case insensitive")
        void caseInsensitiveSearch() {
            List<Book> upperCase = lib.findByAuthor("HARPER LEE");
            List<Book> lowerCase = lib.findByAuthor("harper lee");
            List<Book> mixedCase = lib.findByAuthor("Harper LEE");

            assertEquals(1, upperCase.size());
            assertEquals(1, lowerCase.size());
            assertEquals(1, mixedCase.size());
            assertEquals("To Kill a Mockingbird", upperCase.get(0).title());
        }

        @Test @DisplayName("returns empty list for non-existent author")
        void nonExistentAuthor() {
            List<Book> books = lib.findByAuthor("Non Existent Author");
            assertTrue(books.isEmpty());
        }

        @Test @DisplayName("handles null author gracefully")
        void nullAuthor() {
            List<Book> books = lib.findByAuthor(null);
            assertTrue(books.isEmpty());
        }

        @Test @DisplayName("finds partial author matches")
        void partialAuthorMatch() throws Exception {
            Book book4 = new Book("978-1-234-56789-0", "The Hobbit", "J.R.R. Tolkien", 1937);
            lib.addBook(book4);

            List<Book> tolkienBooks = lib.findByAuthor("tolkien");
            assertEquals(2, tolkienBooks.size());
        }

        @ParameterizedTest
        @ValueSource(strings = {"", "   ", "\t", "\n"})
        @DisplayName("handles empty or whitespace author names")
        void emptyOrWhitespaceAuthor(String author) {
            List<Book> books = lib.findByAuthor(author);
            assertTrue(books.isEmpty());
        }
    }

    @Nested @DisplayName("checkOut()")
    class CheckOutTests {

        @Test @DisplayName("successfully checks out available book")
        void checkOutAvailableBook() throws Exception {
            lib.checkOut("978-0-06-112008-4", "john.doe");
            assertFalse(lib.isAvailable("978-0-06-112008-4"));
            assertEquals("john.doe", lib.getCheckedOutBy("978-0-06-112008-4"));
        }

        @Test @DisplayName("checking out non-existent book throws BookNotFoundException")
        void checkOutNonExistentBook() {
            assertThrows(
                Library.BookNotFoundException.class,
                () -> lib.checkOut("999-invalid-isbn", "john.doe")
            );
        }

        @Test @DisplayName("checking out already checked out book throws BookUnavailableException")
        void checkOutAlreadyCheckedOutBook() throws Exception {
            lib.checkOut("978-0-06-112008-4", "jane.smith");
            
            Library.BookUnavailableException exception = assertThrows(
                Library.BookUnavailableException.class,
                () -> lib.checkOut("978-0-06-112008-4", "john.doe")
            );
            assertTrue(exception.getMessage().contains("already checked out"));
        }

        @Test @DisplayName("multiple books can be checked out by same member")
        void sameUserMultipleBooks() throws Exception {
            lib.checkOut("978-0-06-112008-4", "john.doe");
            lib.checkOut("978-0-618-00222-3", "john.doe");

            assertFalse(lib.isAvailable("978-0-06-112008-4"));
            assertFalse(lib.isAvailable("978-0-618-00222-3"));
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("checking out with invalid member throws appropriate exception")
        void checkOutInvalidMember(String member) {
            assertThrows(Exception.class, () -> lib.checkOut("978-0-06-112008-