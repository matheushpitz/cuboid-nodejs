import { Id, RelationMappings } from 'objection';
import { Bag } from './Bag';
import Base from './Base';

export class Cuboid extends Base {
  id!: Id;
  width!: number;
  height!: number;
  depth!: number;
  bagId?: Id;
  bag!: Bag;  

  get volume(): number {
    return Cuboid.getVolume(this.width, this.height, this.depth);
  }

  toViewModel(): any {
    return {
      id: this.id,
      width: this.width,
      height: this.height,
      depth: this.depth,
      bagId: this.bagId,
      bag: this.bag,
      volume: this.volume,
    };
  }

  static tableName = 'cuboids';

  static getVolume(width: number, height: number, depth: number): number {
    return width * height * depth;
  }

  static get relationMappings(): RelationMappings {
    return {
      bag: {
        relation: Base.BelongsToOneRelation,
        modelClass: 'Bag',
        join: {
          from: 'cuboids.bagId',
          to: 'bags.id',
        },
      },
    };
  }
}

export default Cuboid;
