import { CartDetail } from "src/cart-details/entities/cart-detail.entity";
import { Section } from "src/sections/entities/section.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: 'products'
})
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string


    @Column({
        type: "varchar",
        length: 100
    })
    name: string

    @Column({
        type: "text",
        nullable: false

    })
    description: string

    @Column({
        type: 'text',
        nullable: true,
    })
    imageURL: string

    @Column({
        type: "float",

    })
    price: number

    @Column({
        type: "int",

    })
    amount: number

    @ManyToOne(() => Section, (section) => section.products)
    section: Section

    @OneToMany(() => CartDetail, (cartDetail) => cartDetail.product)
    cartDetails: CartDetail[]
}
