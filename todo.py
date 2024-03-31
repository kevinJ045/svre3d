import os

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

# Function to display tasks
def display_tasks(tasks):
    os.system('clear')
    print("TODO LIST:")
    for category, info in tasks.items():
        print(f"[{category}: {info['percent']}]")
        for task_text, status in info['tasks']:
            print(f"    + {task_text} [{status}]")

# Function to update task status
def update_task_status(tasks, category_index, task_index):
    task_text, status = tasks[category_index]['tasks'][task_index]
    if status == 'X':
        tasks[category_index]['tasks'][task_index] = (task_text, '-')
        print("Marked '{task_text}' as semi-completed")
    elif status == '-':
        tasks[category_index]['tasks'][task_index] = (task_text, ' ')
        print("Marked '{task_text}' as not completed")
    else:
        tasks[category_index]['tasks'][task_index] = (task_text, 'X')
        print(f"Marked '{task_text}' as completed.")

# Main function
def main():
    filename = 'todo.txt'
    tasks = load_tasks(filename)
    while True:
        display_tasks(tasks)
        choice = input("Enter task number to mark as completed (e.g., 1-2), or 'q' to quit: ")
        if choice.lower() == 'q':
            break
        elif '-' in choice:
            category_index, task_index = map(int, choice.split('-'))
            category_index -= 1
            task_index -= 1
            category_name = list(tasks.keys())[category_index]
            if 0 <= category_index < len(tasks) and 0 <= task_index < len(tasks[category_name]['tasks']):
                update_task_status(tasks, category_name, task_index)
                input("Press Enter to continue...")
            else:
                print("Invalid task number. Please try again.")
                input("Press Enter to continue...")
        else:
            print("Invalid input. Please enter a task number or 'q' to quit.")
            input("Press Enter to continue...")

    print("Exiting...")

if __name__ == "__main__":
    main()
