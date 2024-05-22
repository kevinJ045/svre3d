import React, { useState, useContext } from 'react';
import { SlotItem } from './slotitem.js';
import { Items } from '../../repositories/items.js';
import { InventoryItem } from './inventory.js';
import { Context } from '../data/context.js';
const filterFunction = (query) => {
    return (i) => (i.type == 'item' || i.type == 'inventory-item')
        &&
            (i.itemReference ||
                (i.itemReference = Items.all().find(i2 => i.item == i2.id)))
        ?
            (i.itemReference
                .config?.name?.match(query) || i.itemReference
                .id?.match(query))
        :
            ((i.content || i.name || i.title)
                ?.match(query)) || console.log(query, i);
};
function PageContent({ children, selectBook, searchQuery = null }) {
    const navTo = (to) => to ? () => {
        selectBook(to);
    } : () => { };
    return (React.createElement(React.Fragment, null, children
        .filter(searchQuery ? filterFunction(searchQuery) : i => i)
        .map((child, index) => (child.type === 'link' ? React.createElement("a", { key: index, onClick: () => {
            if (child.page) {
                selectBook(child.page);
            }
        }, href: '#' }, child.content) : React.createElement("div", { key: index },
        child.type === 'image' && (React.createElement("img", { onClick: navTo(child.link), src: child.image, alt: child.title || 'image' })),
        child.type === 'text' && (React.createElement("p", { onClick: navTo(child.link) }, child.content)),
        child.type === 'wrapper' && (React.createElement("div", { onClick: navTo(child.link), className: child.row ? 'row' : 's' }, child.content)),
        child.type === 'item' && (React.createElement(SlotItem, { item: Items.create({
                itemID: child.item,
                quantity: child.quantity || 1,
            }), onClick: navTo(child.link), click: false, counter: child.quantity > 0 })),
        child.type === 'inventory-item' && (React.createElement(InventoryItem, { item: Items.create({
                itemID: child.item,
                quantity: child.quantity || 1,
            }), mouse: false, counter: child.quantity > 0, selectItem: navTo(child.link), unselectItem: () => { } })),
        child.children && (React.createElement(PageContent, { selectBook: selectBook, children: child.children })))))));
}
function BookComponent({ books }) {
    const { currentBook, setCurrentBook, currentPage, setCurrentPage } = useContext(Context);
    const [searchQuery, setSearchQuery] = useState('');
    const filteredBooks = books.filter(book => book.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const handleBookSelection = (book) => {
        setCurrentBook(book);
        setCurrentPage(book.pages[0]); // Set the first page as the initial page
    };
    const handlePageSelection = (page) => {
        setCurrentPage(page);
    };
    return (React.createElement("div", { className: "book-component" + (currentBook?.isItemsList ? ' no-flex' : '') },
        currentBook ? null : (React.createElement("div", { className: 'main-list' },
            React.createElement("input", { type: "text", placeholder: "Search for a book...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }),
            React.createElement("ul", null, filteredBooks.map((book) => (React.createElement("li", { key: book.name, onClick: () => handleBookSelection(book) },
                React.createElement("div", { className: "book-icon " + (book.icon || 'book-0') }),
                book.name)))))),
        currentBook && !currentBook.isItemsList && React.createElement("div", { className: "sidebar" }, currentBook && (React.createElement("div", null,
            React.createElement("h3", null,
                React.createElement("span", { className: 'back', onClick: () => { setCurrentBook(null); setCurrentPage(null); } }),
                " Pages"),
            React.createElement("ul", null, currentBook.pages.map((page, index) => (React.createElement("li", { key: index, className: currentPage?.title == page.title ? 'active' : '', onClick: () => handlePageSelection(page) }, page.title))))))),
        currentBook && currentBook.isItemsList && React.createElement(React.Fragment, null,
            React.createElement("h2", null,
                React.createElement("span", { className: 'back', onClick: () => { setCurrentBook(null); setCurrentPage(null); } }),
                " ",
                currentBook.name),
            React.createElement("input", { type: "text", placeholder: "Search...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }),
            React.createElement("div", { className: 'items-list' },
                React.createElement(PageContent, { selectBook: (itemID) => handleBookSelection(books.find(i => i.id == itemID) || null), children: currentBook.pages[0].children, searchQuery: searchQuery }))),
        currentPage && !currentBook?.isItemsList && React.createElement("div", { className: "main-content" }, currentPage && (React.createElement("div", null,
            React.createElement("h2", null, currentPage.title),
            React.createElement(PageContent, { selectBook: (itemID) => handleBookSelection(books.find(i => i.id == itemID) || null), children: currentPage.children }))))));
}
export default BookComponent;
