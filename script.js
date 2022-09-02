// Inisialisasi Array Buku
const books = [];

// Inisialisasi Kumpulan Event
const RENDER_BOOKS = 'render-books';
const SAVED_BOOKS = 'saved-books';
const STORAGE_KEY = 'BOOKS_APPS';

// Fungsi Dasar: Mengecek Fitur Storage
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

// Custom Event DOM: Event Render Semua Kumpulan Buku
document.addEventListener(RENDER_BOOKS, function () {
  // Reset DOM tabel Buku Belum Selesai Dibaca
  const ongoingBooks = document.getElementById('ongoing-books');
  ongoingBooks.innerHTML = '';

  // Reset DOM tabel Buku Selesai Dibaca
  const completedBooks = document.getElementById('completed-books');
  completedBooks.innerHTML = '';

  // Reset DOM tabel Buku Hasil Pencarian
  const searchedBooks = document.getElementById('searched-books');
  searchedBooks.innerHTML = '';

  // Reset Form Input
  document.getElementById('input-buku-judul').value = '';
  document.getElementById('input-buku-penulis').value = '';
  document.getElementById('input-buku-tahun').value = '';
  document.getElementById('input-buku-selesai').checked  = false;

  // Load elemen Buku-Buku sesuai array Books
  for (const book of books) {
    const bookElement = putBook(book);
    if (!book.isCompleted)
      // Load buku Belum Selesai Dibaca
      ongoingBooks.append(bookElement);
    else
      // Load buku Selesai Dibaca
      completedBooks.append(bookElement);
  }
});

// Event DOM: Konten HTML DOM Loaded
document.addEventListener('DOMContentLoaded', function () {
  // Event Listener untuk Form Input Buku
  const formInput = document.getElementById('form-input');
  formInput.addEventListener('submit', function () {
    event.preventDefault();
    addBook();
  });

  // Event Listener untuk Button Reset Form Input Buku
  const buttonReset = document.getElementById('reset-input-buku');
  buttonReset.addEventListener('click', function () {
    resetInputBook();
  });

  // Event Listener untuk Button Search Buku
  const buttonSearch = document.getElementById('cari-buku');
  buttonSearch.addEventListener('click', function () {
    searchBook();
  });

  // Load Data dari Local Storage
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Fungsi Dasar: Save Data ke Storage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_BOOKS));
  }
}

// Fungsi Dasar: Load Data dari Storage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_BOOKS));
}

// Fungsi di Event Render: Membuat Elemen HTML ke Tabel Buku (Belum & Sudah Selesai dibaca)
function putBook(bookObject) {
  // Membuat Elemen HTML
  const bookTitle = document.createElement('td');
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement('td');
  bookAuthor.innerText = bookObject.author;

  const bookYear = document.createElement('td');
  bookYear.innerText = bookObject.year;

  const buttonPindah = document.createElement('button');
  buttonPindah.classList.add('button', 'is-fullwidth', 'is-primary', 'is-outlined', 'is-light', 'is-small');
  buttonPindah.innerText = 'Pindah';

  const buttonHapus = document.createElement('button');
  buttonHapus.classList.add('button', 'is-fullwidth', 'is-danger', 'is-light', 'is-small');
  buttonHapus.innerText = 'Hapus';

  // Mengecek value isCompleted, untuk memberi Fungsi yang cocok pada Button
  if (bookObject.isCompleted) {
    buttonPindah.addEventListener('click', function () {
      moveBookFromCompleted(bookObject.id);
    });
  } else {
    buttonPindah.addEventListener('click', function () {
      moveBookToCompleted(bookObject.id);
    });
  }

  // Memberi button untuk Menghapus Buku
  buttonHapus.addEventListener('click', function () {
    // Melakukan pop-up untuk memastikan mau menghapus buku
    if (confirm("Anda akan menghapus buku. Tekan OK apabila anda yakin.")) {
      removeBook(bookObject.id)
    }
  });

  const containerButton = document.createElement('div');
  containerButton.classList.add('buttons');
  containerButton.append(buttonPindah, buttonHapus);

  const bookAction = document.createElement('td');
  bookAction.append(containerButton);

  const container = document.createElement('tr');
  container.append(bookTitle, bookAuthor, bookYear, bookAction);
  container.setAttribute('id', `book-${bookObject.id}`);

  return container;
}

// Fungsi di Tombol Buku di Tabel: Memindahkan Buku ke Complete
function moveBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_BOOKS));
  saveData();
}

// Fungsi di Tombol Buku di Tabel: Memindahkan Buku dari Complete
function moveBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_BOOKS));
  saveData();
}

// Fungsi di Tombol Buku di Tabel: Menghapus Buku
function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_BOOKS));
  saveData();
}

// Fungsi di pemindahan Buku: Mencari Buku dari ID
function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

// Fungsi di pemindahan Buku: Mencari Index Buku dari ID
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// Fungsi di button Input Buku: Menambah Buku
function addBook() {
  // Mengambil data dari form input
  const bookTitle = document.getElementById('input-buku-judul').value;
  const bookAuthor = document.getElementById('input-buku-penulis').value;
  const bookYear = document.getElementById('input-buku-tahun').value;
  const bookIsComplete = document.getElementById('input-buku-selesai').checked;

  // Membuat ID unik
  const generatedID = generateId();

  // Membuat Object Buku dari data diatas, dan memasukkan ke array books
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_BOOKS));
  saveData();
}

// Fungsi di pembuatan Buku: Generate ID Unik
function generateId() {
  return +new Date();
}

// Fungsi di pembuatan Buku: Generate JS Object Buku
function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}

// Fungsi di Button Reset Input Buku: Reset Form
function resetInputBook() {
  document.dispatchEvent(new Event(RENDER_BOOKS));
}

// Fungsi di Button Cari Buku: Generate Elemen HTML sesuai Query Pencarian
function searchBook() {
  // Mereset tabel hasil pencarian
  document.dispatchEvent(new Event(RENDER_BOOKS));

  // Mengambil data query dari input
  const bookQueryInput = document.getElementById('input-cari-buku').value;

  // Inisialisasi array untuk hasil pencarian
  let searchResult = [];

  // Melakukan Looping mencari di array Books yang memiliki judul yang sama dengan Query
  books.forEach(book => {
    let isMatch = book.title.includes(bookQueryInput);
    if (isMatch) {
      searchResult.push(book);
    }
  })

  // Membuat elemen html berbentuk tabel
  if(searchResult.length > 0){
   const tableContainer = document.createElement('table');
   tableContainer.classList.add('table', 'is-bordered', 'is-striped', 'is-narrow', 'is-hoverable', 'is-fullwidth');

   const tableHead = document.createElement('thead');
   tableHead.innerHTML = '<th>Judul</th><th>Penulis</th><th>Tahun</th><th>Lokasi</th>'
   tableContainer.append(tableHead);

   const tableBody = document.createElement('tbody');

   for (let i in searchResult) {
    const tableQuery = document.createElement('tr');

    const bookTitle = document.createElement('td');
    bookTitle.innerText = searchResult[i].title;

    const bookAuthor = document.createElement('td');
    bookAuthor.innerText = searchResult[i].author;

    const bookYear = document.createElement('td');
    bookYear.innerText = searchResult[i].year;

    const bookLocation = document.createElement('td');
    if (searchResult[i].isCompleted) {
      bookLocation.innerText = 'Rak Selesai Dibaca';
    } else {
      bookLocation.innerText = 'Rak Belum Selesai Dibaca';
    }

    tableQuery.append(bookTitle, bookAuthor, bookYear, bookLocation);
    tableBody.append(tableQuery);
    }
  
  tableContainer.append(tableHead, tableBody);
  
  // Memunculkan tabel hasil pencarian
  document.getElementById('searched-books').append(tableContainer);

  // Mereset input query
  document.getElementById('input-cari-buku').value = '';
  }
}
