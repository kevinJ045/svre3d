#!/bin/python

import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk

# Function to load tasks from file
def load_tasks(filename):
    tasks = {}
    with open(filename, 'r') as file:
        category = ''
        for line in file:
            line = line.strip()
            if line:
                if line.startswith('[') and line.endswith(']'):
                    category, percent = line.split(':', 1)
                    category = category[1:].strip()
                    percent = percent[:-1].strip()
                    tasks[category] = {'percent': percent, 'tasks': []}
                elif line.startswith('+'):
                    task_text = line.split('[', 1)[0].strip()[2:]
                    tasks[category]['tasks'].append((task_text, line[-2]))
    return tasks

# Function to save tasks to file
def save_tasks(filename, tasks):
    with open(filename, 'w') as file:
        for category, info in tasks.items():
            file.write(f"[{category}: {info['percent']}]\n")
            for task_text, status in info['tasks']:
                file.write(f"\t+ {task_text} [{status}]\n")
            file.write(f"\n")

class MainWindow(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="TODO List")
        self.set_default_size(400, 300)

        self.tasks = load_tasks('todo_gui.txt')
        self.task_list_store = Gtk.ListStore(str, str, str)
        self.populate_task_list_store()

        self.task_tree_view = Gtk.TreeView(model=self.task_list_store)

        category_renderer = Gtk.CellRendererText()
        category_column = Gtk.TreeViewColumn("Category", category_renderer, text=0)
        self.task_tree_view.append_column(category_column)

        task_renderer = Gtk.CellRendererText()
        task_column = Gtk.TreeViewColumn("Task", task_renderer, text=1)
        self.task_tree_view.append_column(task_column)

        status_renderer = Gtk.CellRendererText()
        status_column = Gtk.TreeViewColumn("Status", status_renderer, text=2)
        self.task_tree_view.append_column(status_column)

        self.task_tree_view.connect("row-activated", self.on_row_activated)

        scrolled_window = Gtk.ScrolledWindow()
        scrolled_window.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
        scrolled_window.add(self.task_tree_view)

        self.add(scrolled_window)

    def populate_task_list_store(self):
        for category, info in self.tasks.items():
            for task_text, status in info['tasks']:
                self.task_list_store.append([category, task_text, status])

    def on_row_activated(self, treeview, path, column):
        # Get the selected row
        selection = treeview.get_selection()
        model, iter = selection.get_selected()
        if iter is not None:
            # Get the current status of the task
            current_status = model.get_value(iter, 2)
            # Update the status based on the current status
            if current_status == 'X':  # Complete
                new_status = '-'
            elif current_status == '-':  # Semi-complete
                new_status = ' '
            else:  # Incomplete
                new_status = 'X'
            # Update the model
            model.set_value(iter, 2, new_status)
            # Update tasks dictionary
            category = model.get_value(iter, 0)
            task_text = model.get_value(iter, 1)
            for i, task_info in enumerate(self.tasks[category]['tasks']):
                if task_info[0] == task_text:
                    self.tasks[category]['tasks'][i] = (task_text, new_status)
                    break
            # Save tasks to file
            save_tasks('todo_gui.txt', self.tasks)

win = MainWindow()
win.connect("destroy", Gtk.main_quit)
win.show_all()
Gtk.main()
