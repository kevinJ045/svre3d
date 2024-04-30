
import React, { useState, useEffect } from 'react';
import { SlotItem } from './slotitem';
import { Item } from '../../models/item';
import { Items } from '../../repositories/items';

type bookpagechild = {
  type: string,
  [key: string]: any
}
type bookpage = {
  title: string,
  children: bookpagechild[]
}
type book = {
  name: string,
  icon: string,
  id: string,
  pages: bookpage[]
}

function PageContent({ children, selectBook }) {
  return (
    <div>
      {children.map((child, index) => (
        child.type === 'link' ?  <a key={index} onClick={() => {
          if(child.page){
            selectBook(child.page);
          }
        }} href='#'>{child.content}</a> : <div key={index}>
          {child.type === 'image' && (
            <img src={child.image} alt={child.title || 'image'} />
          )}
          {child.type === 'text' && (
            <p>{child.content}</p>
          )}
          {child.type === 'wrapper' && (
            <div className={child.row ? 'row' : 's'}>{child.content}</div>
          )}
          {child.type === 'item' && (
            <p>
              <SlotItem
                item={Items.create({
                  itemID: child.item,
                  quantity: child.quantity || 1
                } as any)}
                click={false}
              />
            </p>
          )}
          {child.children && (
            <PageContent selectBook={selectBook} children={child.children} />
          )}
        </div>
      ))}
    </div>
  );
}

function BookComponent({ books }: { books: book[] }) {
  const [currentBook, setCurrentBook] = useState<book | null>(null);
  const [currentPage, setCurrentPage] = useState<bookpage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = books.filter(book => book.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleBookSelection = (book) => {
    setCurrentBook(book);
    setCurrentPage(book.pages[0]); // Set the first page as the initial page
  };

  const handlePageSelection = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="book-component">

      {
        currentBook ? null : (
          <div className='main-list'>
            <input
              type="text"
              placeholder="Search for a book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <ul>
              {filteredBooks.map((book) => (
                <li key={book.name} onClick={() => handleBookSelection(book)}>
                  <div className={"book-icon " + (book.icon || 'book-0')}></div>
                  {book.name}
                </li>
              ))}
            </ul>
          </div>
        )
      }

      {currentBook && <div className="sidebar">
        {currentBook && (
          <div>
            <h3><span className='back' onClick={() => { setCurrentBook(null); setCurrentPage(null); }}></span> Pages</h3>
            <ul>
              {currentBook.pages.map((page, index) => (
                <li key={index} className={currentPage?.title == page.title ? 'active' : ''} onClick={() => handlePageSelection(page)}>
                  {page.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>}

      {currentPage && <div className="main-content">
        {currentPage && (
          <div>
            <h2>{currentPage.title}</h2>
            <PageContent selectBook={(itemID: string) => handleBookSelection(
              books.find(i => i.id == itemID) || null
            )} children={currentPage.children} />
          </div>
        )}
      </div>}
    </div>
  );
}

export default BookComponent;