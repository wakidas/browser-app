import { EventListener } from "./EventListener";
import { Status, Task, statusMap } from "./Task";
import { TaskCollection } from "./TaskCollection";
import { TaskRenderer } from "./TaskRenderer";

class Application {
  private readonly eventListener = new EventListener();
  private readonly taskColleciotn = new TaskCollection();
  private readonly taskRenderer = new TaskRenderer(
    document.getElementById("todoList") as HTMLElement,
    document.getElementById("doingList") as HTMLElement,
    document.getElementById("doneList") as HTMLElement
  );

  start() {
    const createForm = document.getElementById("createForm") as HTMLElement;
    const deleteAllDoneTaskButton = document.getElementById(
      "deleteAllDoneTask"
    ) as HTMLElement;

    this.eventListener.add(
      "submit-handler",
      "submit",
      createForm,
      this.handleSubmit
    );

    this.eventListener.add(
      "submit-handler",
      "click",
      deleteAllDoneTaskButton,
      this.handleClickDeleteAllTasks
    );

    this.taskRenderer.subscribeDragAndDrop(this.handleDropAndDrop);
  }

  private handleDropAndDrop = (
    el: Element,
    sibling: Element | null,
    newStatus: Status
  ) => {
    const taskId = this.taskRenderer.getId(el);

    if (!taskId) return;

    const task = this.taskColleciotn.find(taskId);

    if (!task) return;

    task.update({ status: newStatus });
    this.taskColleciotn.update(task);

    console.log(sibling);
  };

  private handleSubmit = (e: Event) => {
    e.preventDefault();

    const titleInput = document.getElementById("title") as HTMLInputElement;

    if (!titleInput.value) return;

    const task = new Task({ title: titleInput.value });
    this.taskColleciotn.add(task);

    const { deleteButtonEl } = this.taskRenderer.append(task);

    this.eventListener.add(task.id, "click", deleteButtonEl, () =>
      this.handleClickDeleteTask(task)
    );
    titleInput.value = "";
  };

  private handleClickDeleteTask = (task: Task) => {
    if (!window.confirm(`「${task.title}」を削除してもよろしいですか？`))
      return;

    this.eventListener.remove(task.id);
    this.taskColleciotn.delete(task);
    this.taskRenderer.remove(task);
  };

  private handleClickDeleteAllTasks = () => {
    if (!window.confirm("DONE のタスクを一括削除してもよろしいでしょうか？"))
      return;

    const doneTasks = this.taskColleciotn.filter(statusMap.done);

    console.log(doneTasks);
  };
}

window.addEventListener("load", () => {
  const app = new Application();
  app.start();
});
