import { Injectable } from "@angular/core";
import { Product } from "./product.model";
import { Repository } from './repository';

@Injectable()
export class Cart {
    selections: ProductSelection[] = [];
    itemCount: number = 0;
    totalPrice: number = 0;

    constructor(private repo: Repository) {
        repo.getSessionData<ProductSelection[]>("cart").subscribe(cartData => {
            if (cartData != null) {
                //cartData.forEach(item => this.selections.push(item));
                cartData.forEach(item =>
                {
                    //	Transform the data structure into a full instance with methods.
                    let ps = new ProductSelection(this,
                        item.productId,
                        item.name,
                        item.price,
                        item.quantity);
                    //	Push the instance into the collection.
                    //	Two-way binding will now work because properties and methods exist.
                    //	Pushing the bare structure fails to provide methods and properties.
                    this.selections.push(ps);
                });
                this.update(false);
            }
        });
    }

    addProduct(product: Product) {
        let selection = this.selections
            .find(ps => ps.productId == product.productId);
        if (selection) {
            selection.quantity++;
        } else {
            this.selections.push(new ProductSelection(this,
                product.productId, product.name,
                product.price, 1));
        }
        this.update();
    }

    updateQuantity(productId: number, quantity: number) {
        if (quantity > 0) {
            let selection = this.selections.find(ps => ps.productId == productId);
            if (selection) {
                selection.quantity = quantity;
            }
        } else {
            let index = this.selections.findIndex(ps => ps.productId == productId);
            if (index != -1) {
                this.selections.splice(index, 1);
            }
            this.update();
        }
    }

    clear() {
        this.selections = [];
        this.update();
    }

    update(storeData: boolean = true) {
        this.itemCount = this.selections.map(ps => ps.quantity)
            .reduce((prev, curr) => prev + curr, 0);
        this.totalPrice = this.selections.map(ps => ps.price * ps.quantity)
            .reduce((prev, curr) => prev + curr, 0);
        if (storeData) {
            this.repo.storeSessionData("cart", this.selections.map(s => {
                return {
                    productId: s.productId, name: s.name,
                    price: s.price, quantity: s.quantity
                }
            }));
        }
    }
}

export class ProductSelection {

    constructor(public cart: Cart,
        public productId?: number,
        public name?: string,
        public price?: number,
        private quantityValue?: number) { }

    get quantity() {
        return this.quantityValue;
    }

    set quantity(newQuantity: number) {
        this.quantityValue = newQuantity;
        this.cart.update();
    }
}
