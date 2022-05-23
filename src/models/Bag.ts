import { Id, RelationMappings } from 'objection';
import { Cuboid } from './Cuboid';
import Base from './Base';

export class Bag extends Base {
  id!: Id;
  volume!: number;
  title!: string;
  cuboids?: Cuboid[] | undefined;

  get payloadVolume(): number {
    return this.cuboids ? this.cuboids.reduce((acc, cur) => acc + cur.volume, 0) : 0;
  }

  get availableVolume(): number {
    return this.volume - this.payloadVolume;
  }

  toViewModel(): any {
    return {
      id: this.id,
      volume: this.volume,
      title: this.title,
      payloadVolume: this.payloadVolume,
      availableVolume: this.availableVolume,
      cuboids: this.cuboids,
    };
  }

  static tableName = 'bags';

  static get relationMappings(): RelationMappings {
    return {
      cuboids: {
        relation: Base.HasManyRelation,
        modelClass: 'Cuboid',
        join: {
          from: 'bags.id',
          to: 'cuboids.bagId',
        },
      },
    };
  }
}

export default Bag;
