import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Id } from 'objection';
import { Bag, Cuboid } from '../models';

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ids = req.query.ids as Id[];
  const cuboids = await Cuboid.query().findByIds(ids).withGraphFetched('bag');

  return res.status(200).json(cuboids.map(x => x.toViewModel()));
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const cuboid = await Cuboid.query().findById(id);

  if(!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  return res.status(HttpStatus.OK).json(cuboid.toViewModel());
}

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth, bagId } = req.body;

  const bag = await Bag.query().findById(bagId).withGraphFetched('cuboids');
  if(!bag) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  const cuboidVolume = Cuboid.getVolume(width, height, depth);
  if(cuboidVolume > bag.availableVolume) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      message: 'Insufficient capacity in bag'
    });
  }

  const cuboid = await Cuboid.query().insert({
    width,
    height,
    depth,
    bagId,
  });

  return res.status(HttpStatus.CREATED).json(cuboid?.toViewModel());
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { width, height, depth, id } = req.body;

  const cuboid = await Cuboid.query().findById(id);
  if(!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  if(cuboid.bagId) {
    const bag = await Bag.query().findById(cuboid.bagId).withGraphFetched('cuboids');
    if(!bag) {
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    const volumeDif = Cuboid.getVolume(width, height, depth) - cuboid.volume;
    if(volumeDif > bag?.availableVolume) {
      return res.sendStatus(HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }  

  const newCuboid = await cuboid.$query().updateAndFetch({
    width,
    height,
    depth
  }).withGraphFetched('bag');

  return res.status(HttpStatus.OK).json(newCuboid?.toViewModel());
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  return res.sendStatus(200);
};
