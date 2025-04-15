/**
 * ```ts
 * // Example usage
 * 
 * class MessageDisplay implements Observer {
 *     private name: string;
 * 
 *     constructor(name: string) {
 *         this.name = name;
 *     }
 * 
 *     // Handle the notification
 *     public update(message: string): void {
 *         console.log(`${this.name} received message: ${message}`);
 *         // Here you would handle displaying the message in your UI
 *     }
 * }
 * 
 * // Create the sender
 * const sender = new Sender();
 * 
 * // Create receivers
 * const display1 = new MessageDisplay("MainDisplay");
 * const display2 = new MessageDisplay("SecondaryDisplay");
 * 
 * // Register the receivers with the sender
 * sender.addObserver(display1);
 * sender.addObserver(display2);
 * 
 * // Send a message - both displays will receive it
 * sender.sendMessage("Hello, this is a test notification!");
 * 
 * // Remove one observer
 * sender.removeObserver(display2);
 * 
 * // Send another message - only display1 will receive it
 * sender.sendMessage("This message goes to fewer displays");
 * ```
 */

// Define an interface for the observer (the class that receives notifications)
export interface Observer {
    update(message: string): void;
}

// Define the subject (the class that sends notifications)
export class Sender {
    private observers: Observer[] = [];

    // Register an observer
    public addObserver(observer: Observer): void {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }

    // Remove an observer
    public removeObserver(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }

    // Example method that triggers a notification
    public sendMessage(message: string): void {
        // console.log(`Sending message: ${message}`);
        this.notifyObservers(message);
    }

    // ---------------------------------------------------------

    // Notify all observers
    protected notifyObservers(message: string): void {
        this.observers.forEach(observer => {
            observer.update(message);
        });
    }
}

