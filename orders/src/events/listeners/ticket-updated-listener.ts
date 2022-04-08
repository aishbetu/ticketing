import {Message} from "node-nats-streaming";
import {Listener, Subjects, TicketUpdatedEvent} from '@aishtickets/common';
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
        // Uncomment if we want to remove updateIfCurrentPlugin and update version no. as per ticket publisher emits
        // const { title, price, version } = data;
        const { title, price } = data;
        const ticket = await Ticket.findByEvent(data);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // ticket.set({ title, price, version });
        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}
