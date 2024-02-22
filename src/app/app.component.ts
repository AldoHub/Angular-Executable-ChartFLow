import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ChartNode } from './interfaces/ChartNode';

import {MatTreeModule, MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import { FormsModule}  from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatTreeModule, MatToolbarModule, MatIconModule, MatButtonModule, MatInputModule, FormsModule, MatFormFieldModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ang-flowchart';

  code:string = '';
  treeData: ChartNode[] = []; 

  //tree definition
  treeControl = new NestedTreeControl<ChartNode>((node: any) => node.children);
  //datesource
  dataSource = new MatTreeNestedDataSource<ChartNode>();
  hasChild = (_: number, node: ChartNode) => !!node.children && node.children.length > 0;

  //add nodes
  addNode(name: string){
    //commands cannot have nested children
    if(name === 'command'){
        
        this.treeData.push({
          name: "command",
          code: "",
        });

    }else{
        //can have children
        this.treeData.push({
          name: name,
          code: "",
          children: []
        })
    }
    //update the tree data
    this.dataSource.data = this.treeData;
  }
 
  //add node to another node
  addNodeToNode(name: string, node: ChartNode){
    //commands cannot have nested children
    if(name === 'command'){
        
        node.children?.push({
          name: "command",
          code: "",
        });

    }else{
        //can have children
        node.children?.push({
          name: name,
          code: "",
          children: []
        })
    }
    //update the tree data
    this.refreshTree();
  }


  //delete a node
  deleteNode(subTree: ChartNode[], n: ChartNode){
    subTree.forEach(node => {
      if(node === n){
        subTree.splice(subTree.indexOf(node), 1);
      }else{
        if(node.children){
          this.deleteNode(node.children, n);
        }
      }     
    })
  }

  //update the tree data
  refreshTree(){
    this.dataSource.data = [];
    this.dataSource.data = this.treeData;
  }


  remove(subTree: ChartNode[], n: ChartNode){
    this.deleteNode(subTree, n);
    console.log(this.treeData);
  }

  //reset the tree data
  reset(){
    this.treeData = [];
    this.dataSource.data = [];
  }

  //turn the tree "code" into js code 
  transpile(subTree: ChartNode[]){
    
    subTree.forEach(node => {
      if(node.name === "for"){
        this.code += node.name + '(let ' + node.code + '){\n';
        this.transpile(node.children!);
        this.code += '}\n';
      }else if(node.name === 'while' || node.name === 'if'){
        this.code += node.name + '(' + node.code + '){\n';
        this.transpile(node.children!);
        this.code += '}\n';
      }else if(node.name === 'else'){
        this.code += node.name + '{\n';
        this.transpile(node.children!);
        this.code += '}\n';
      }else{
        this.code += node.code + ';\n';
      }
    })
    
  }

  //---- TODO: check eval alternatives and implement one of them
  //exec code -- not the most secure way to do it 
  compile(subTree: ChartNode[]){
    this.code = '';
    this.transpile(subTree);
    console.log(`code to run: ${this.code}`);

    try{
      //runs the code
      eval(this.code);
    }catch(err){
      console.error(err);
    }


  }

}

