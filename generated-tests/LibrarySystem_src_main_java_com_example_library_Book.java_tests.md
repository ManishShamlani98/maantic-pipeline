# AI Generated Tests for LibrarySystem/src/main/java/com/example/library/Book.java

Mode: Generated from scratch

# QA ANALYSIS FOR BOOK CLASS

=== ANALYSIS ===
This code defines an immutable `Book` record with validation in the compact constructor. It validates that ISBN, title, and author are not null/blank, and that the year is a 4-digit number (1000-9999). The record automatically provides equals, hashCode, toString, and accessor methods.

=== BDD SCENARIOS (GHERKIN) ===

```gherkin
Feature: Book Creation and Validation
  As a library system
  I want to create valid book records
  So that I can maintain data integrity

  @smoke @regression
  Scenario: Create a valid book with all required fields
    Given I have valid book details
    When I create a book with ISBN "978-0134685991", title "Effective Java", author "Joshua Bloch", and year 2018
    Then the book should be created successfully
    And all fields should be accessible

  @smoke @regression
  Scenario: Book equality and immutability
    Given I have two books with identical details
    When I compare them for equality
    Then they should be equal
    And their hash codes should be the same

  @regression @edge
  Scenario Outline: Invalid book creation should fail
    Given I want to create a book
    When I create a book with ISBN "<isbn>", title "<title>", author "<author>", and year <year>
    Then an IllegalArgumentException should be thrown
    And the error message should contain "<error_message>"

    Examples:
      | isbn           | title         | author        | year | error_message        |
      |                | Effective Java| Joshua Bloch  | 2018 | ISBN must not be blank |
      | 978-0134685991 |               | Joshua Bloch  | 2018 | Title must not be blank|
      | 978-0134685991 | Effective Java|               | 2018 | Author must not be blank|
      | 978-0134685991 | Effective Java| Joshua Bloch  | 999  | Year must be 4-digit |
      | 978-0134685991 | Effective Java| Joshua Bloch  | 10000| Year must be 4-digit |

  @edge @regression
  Scenario: Book with minimum valid year
    Given I want to create a book with the earliest valid year
    When I create a book with year 1000
    Then the book should be created successfully

  @edge @regression
  Scenario: Book with maximum valid year
    Given I want to create a book with the latest valid year
    When I create a book with year 9999
    Then the book should be created successfully
```

=== TDD TEST SCRIPT ===

```java
package com.example.library;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Book Tests")
class BookTest {

    @Test
    @DisplayName("Should create valid book with all required fields")
    void shouldCreateValidBookWithAllRequiredFields() {
        // Given
        String isbn = "978-0134685991";
        String title = "Effective Java";
        String author = "Joshua Bloch";
        int year = 2018;

        // When
        Book book = new Book(isbn, title, author, year);

        // Then
        assertNotNull(book);
        assertEquals(isbn, book.isbn());
        assertEquals(title, book.title());
        assertEquals(author, book.author());
        assertEquals(year, book.year());
    }

    @Test
    @DisplayName("Should maintain book equality and immutability")
    void shouldMaintainBookEqualityAndImmutability() {
        // Given
        Book book1 = new Book("978-0134685991", "Effective Java", "Joshua Bloch", 2018);
        Book book2 = new Book("978-0134685991", "Effective Java", "Joshua Bloch", 2018);

        // When & Then
        assertEquals(book1, book2);
        assertEquals(book1.hashCode(), book2.hashCode());
        assertEquals(book1.toString(), book2.toString());
    }

    @ParameterizedTest
    @DisplayName("Should reject null or blank ISBN")
    @ValueSource(strings = {"", " ", "   "})
    void shouldRejectNullOrBlankIsbn(String invalidIsbn) {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            new Book(invalidIsbn, "Valid Title", "Valid Author", 2020)
        );
        assertTrue(exception.getMessage().contains("ISBN must not be blank"));
    }

    @Test
    @DisplayName("Should reject null ISBN")
    void shouldRejectNullIsbn() {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            new Book(null, "Valid Title", "Valid Author", 2020)
        );
        assertTrue(exception.getMessage().contains("ISBN must not be blank"));
    }

    @ParameterizedTest
    @DisplayName("Should reject null or blank title")
    @ValueSource(strings = {"", " ", "   "})
    void shouldRejectNullOrBlankTitle(String invalidTitle) {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            new Book("978-0134685991", invalidTitle, "Valid Author", 2020)
        );
        assertTrue(exception.getMessage().contains("Title must not be blank"));
    }

    @Test
    @DisplayName("Should reject null title")
    void shouldRejectNullTitle() {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            new Book("978-0134685991", null, "Valid Author", 2020)
        );
        assertTrue(exception.getMessage().contains("Title must not be blank"));
    }

    @ParameterizedTest
    @DisplayName("Should reject null or blank author")
    @ValueSource(strings = {"", " ", "   "})
    void shouldRejectNullOrBlankAuthor(String invalidAuthor) {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            new Book("978-0134685991", "Valid Title", invalidAuthor, 2020)
        );
        assertTrue(exception.getMessage().contains("Author must not be blank"));
    }

    @Test
    @DisplayName("Should reject null author")
    void shouldRejectNullAuthor() {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            new Book("978-0134685991", "Valid Title", null, 2020)
        );
        assertTrue(exception.getMessage().contains("Author must not be blank"));
    }

    @ParameterizedTest
    @DisplayName("Should reject invalid years")
    @ValueSource(ints = {999, 500, 0, -1, 10000, 2025})
    void shouldRejectInvalidYears(int invalidYear) {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            new Book("978-0134685991", "Valid Title", "Valid Author", invalidYear)
        );
        assertTrue(exception.getMessage().contains("Year must be 4-digit"));
    }

    @ParameterizedTest
    @DisplayName("Should accept valid boundary years")
    @ValueSource(ints = {1000, 9999})
    void shouldAcceptValidBoundaryYears(int validYear) {
        // When & Then
        assertDoesNotThrow(() -> {
            Book book = new Book("978-0134685991", "Valid Title", "Valid Author", validYear);
            assertEquals(validYear, book.year());
        });
    }

    @ParameterizedTest
    @DisplayName("Should handle various valid inputs")
    @CsvSource({
        "'978-0134685991', 'Effective Java', 'Joshua Bloch', 2018",
        "'123-456-789', 'Test Book', 'Test Author', 1000",
        "'987-654-321', 'Another Book', 'Another Author', 9999",
        "'ISBN123', 'Single Word Title', 'SingleName', 2020"
    })
    void shouldHandleVariousValidInputs(String isbn, String title, String author, int year) {
        // When
        Book book = new Book(isbn, title, author, year);

        // Then
        assertNotNull(book);
        assertEquals(isbn, book.isbn());
        assertEquals(title, book.title());
        assertEquals(author, book.author());
        assertEquals(year, book.year());
    }

    @Test
    @DisplayName("Should generate meaningful toString")
    void shouldGenerateMeaningfulToString() {
        // Given
        Book book = new Book("978-0134685991", "Effective Java", "Joshua Bloch", 2018);

        // When
        String toString = book.toString();

        // Then
        assertTrue(toString.contains("978-0134685991"));
        assertTrue(toString.contains("Effective Java"));
        assertTrue(toString.contains("Joshua Bloch"));
        assertTrue(toString.contains("2018"));
    }
}
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
      uses: actions/setup-java@v3
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
        cd LibrarySystem
        if [ ! -f pom.xml ]; then
          cat > pom.xml << EOF
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
                    <version>\${junit.version}</version>
                    <scope>test</scope>
                </dependency>
            </dependencies>
            
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.apache.maven.